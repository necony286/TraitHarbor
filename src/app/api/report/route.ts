import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logError, logInfo, logWarn } from '../../../../lib/logger';
import { generateReportPdf } from '../../../../lib/pdf';
import { getSupabaseAdminClient } from '../../../../lib/supabase';
import { getReportPath, getReportSignedUrl, uploadReport } from '../../../../lib/storage';

const requestSchema = z.object({
  orderId: z.string().uuid(),
  reportAccessToken: z.string().uuid(),
  name: z.string().max(80).optional()
});

const orderSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  result_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  report_access_token: z.string().uuid().nullable().optional(),
  user_id: z.string().uuid()
});

const resultSchema = z.object({
  id: z.string().uuid(),
  traits: z.object({
    O: z.number(),
    C: z.number(),
    E: z.number(),
    A: z.number(),
    N: z.number()
  })
});

export const runtime = 'nodejs';

interface UpsertReportAssetParams {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  orderId: string;
  userId: string;
  reportPath: string;
  logMessage: string;
  kind: 'report_pdf';
}
}

async function upsertReportAsset({
  supabase,
  orderId,
  userId,
  reportPath,
  logMessage,
  kind
}: UpsertReportAssetParams) {
  const { error: assetsError } = await supabase.from('assets').upsert(
    {
      user_id: userId,
      order_id: orderId,
      kind,
      path: reportPath
    },
    { onConflict: 'order_id,kind' }
  );

  if (assetsError) {
    logWarn(logMessage, { orderId, error: assetsError.message });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report generation.', { error });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id, status, result_id, created_at, report_access_token, user_id')
    .eq('id', parsed.data.orderId)
    .single();

  if (orderError || !orderData) {
    logWarn('Unable to find order for report generation.', { orderId: parsed.data.orderId, error: orderError });
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const parsedOrder = orderSchema.safeParse(orderData);
  if (!parsedOrder.success) {
    logError('Order payload invalid for report generation.', { orderId: parsed.data.orderId });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }

  if (parsedOrder.data.status !== 'paid') {
    return NextResponse.json({ error: 'Order not paid.' }, { status: 403 });
  }

  if (!parsedOrder.data.result_id) {
    return NextResponse.json({ error: 'Result not attached to order.' }, { status: 400 });
  }

  if (parsedOrder.data.report_access_token !== parsed.data.reportAccessToken) {
    logWarn('Invalid report access token for report generation.', { orderId: parsedOrder.data.id });
    return NextResponse.json({ error: 'Invalid report access token.' }, { status: 403 });
  }

  const reportPath = getReportPath(parsedOrder.data.id);
  const existingUrl = await getReportSignedUrl(parsedOrder.data.id);
  if (existingUrl) {
    await upsertReportAsset({
      supabase,
      orderId: parsedOrder.data.id,
      userId: parsedOrder.data.user_id,
      reportPath,
      logMessage: 'Failed to persist cached report metadata.',
      kind: 'report_pdf'
    });

    logInfo('Using cached report PDF.', { orderId: parsedOrder.data.id });
    return NextResponse.json({ url: existingUrl, cached: true });
  }

  const { data: resultData, error: resultError } = await supabase
    .from('results')
    .select('id, traits')
    .eq('id', parsedOrder.data.result_id)
    .single();

  if (resultError || !resultData) {
    logWarn('Unable to fetch result for report generation.', {
      orderId: parsedOrder.data.id,
      resultId: parsedOrder.data.result_id,
      error: resultError
    });
    return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
  }

  const parsedResult = resultSchema.safeParse(resultData);
  if (!parsedResult.success) {
    logError('Result payload invalid for report generation.', { orderId: parsedOrder.data.id });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }

  try {
    const pdfBuffer = await generateReportPdf({
      name: parsed.data.name ?? 'You',
      date: new Date(parsedOrder.data.created_at),
      traits: parsedResult.data.traits
    });

    await uploadReport(parsedOrder.data.id, pdfBuffer);

    const signedUrl = await getReportSignedUrl(parsedOrder.data.id);
    if (!signedUrl) {
      throw new Error('Unable to create signed report URL.');
    }

    await upsertReportAsset({
      supabase,
      orderId: parsedOrder.data.id,
      userId: parsedOrder.data.user_id,
      reportPath,
      logMessage: 'Failed to persist report metadata.',
      kind: 'report_pdf'
    });

    logInfo('Report generated and stored.', { orderId: parsedOrder.data.id, resultId: parsedOrder.data.result_id });

    return NextResponse.json({ url: signedUrl, cached: false });
  } catch (error) {
    logError('Report generation failed.', { orderId: parsedOrder.data.id, error });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }
}
