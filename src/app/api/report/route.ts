import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logError, logInfo, logWarn } from '../../../../lib/logger';
import { generateReportPdf } from '../../../../lib/pdf';
import { getOrderById, getReportAsset, getScoresByResultId, storeReportAsset } from '../../../../lib/db';
import { getReportPath, getReportSignedUrl, uploadReport } from '../../../../lib/storage';

const requestSchema = z.object({
  orderId: z.string().uuid(),
  reportAccessToken: z.string().uuid(),
  name: z.string().max(80).optional()
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

  let order;
  try {
    const { data, error: orderError } = await getOrderById({ orderId: parsed.data.orderId });
    if (orderError) {
      logWarn('Unable to find order for report generation.', { orderId: parsed.data.orderId, error: orderError });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (!data) {
      logWarn('Unable to find order for report generation.', { orderId: parsed.data.orderId });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    order = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report generation.', { error });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }

  if (order.status !== 'paid') {
    return NextResponse.json({ error: 'Order not paid.' }, { status: 403 });
  }

  if (!order.response_id) {
    return NextResponse.json({ error: 'Result not attached to order.' }, { status: 400 });
  }

  if (order.report_access_token !== parsed.data.reportAccessToken) {
    logWarn('Invalid report access token for report generation.', { orderId: order.id });
    return NextResponse.json({ error: 'Invalid report access token.' }, { status: 403 });
  }

  const reportPath = getReportPath(order.id);
  const existingUrl = await getReportSignedUrl(order.id);
  if (existingUrl) {
    const { data: existingAsset, error: assetLookupError } = await getReportAsset(order.id, 'report_pdf');
    if (assetLookupError) {
      logWarn('Failed to lookup cached report metadata.', { orderId: order.id, error: assetLookupError.message });
    }

    if (!existingAsset) {
      const { error: assetError } = await storeReportAsset({
        orderId: order.id,
        userId: order.user_id,
        reportPath,
        kind: 'report_pdf'
      });
      if (assetError) {
        logWarn('Failed to persist cached report metadata.', { orderId: order.id, error: assetError.message });
      }
    }

    logInfo('Using cached report PDF.', { orderId: order.id });
    return NextResponse.json({ url: existingUrl, cached: true });
  }

  const { data: traits, error: resultError } = await getScoresByResultId(order.response_id);
  if (resultError || !traits) {
    logWarn('Unable to fetch result for report generation.', {
      orderId: order.id,
      resultId: order.response_id,
      error: resultError
    });
    return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
  }

  const parsedResult = resultSchema.safeParse({ id: order.response_id, traits });
  if (!parsedResult.success) {
    logError('Result payload invalid for report generation.', { orderId: order.id });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }

  try {
    const pdfBuffer = await generateReportPdf({
      name: parsed.data.name ?? 'You',
      date: new Date(order.created_at),
      traits: parsedResult.data.traits
    });

    await uploadReport(order.id, pdfBuffer);

    const signedUrl = await getReportSignedUrl(order.id);
    if (!signedUrl) {
      throw new Error('Unable to create signed report URL.');
    }

    const { error: assetError } = await storeReportAsset({
      orderId: order.id,
      userId: order.user_id,
      reportPath,
      kind: 'report_pdf'
    });
    if (assetError) {
      logWarn('Failed to persist report metadata.', { orderId: order.id, error: assetError.message });
    }

    logInfo('Report generated and stored.', { orderId: order.id, resultId: order.response_id });

    return NextResponse.json({ url: signedUrl, cached: false });
  } catch (error) {
    logError('Report generation failed.', { orderId: order.id, error });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }
}
