import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logError, logInfo, logWarn } from '../../../../lib/logger';
import { enforceRateLimit } from '../../../../lib/rate-limit';
import { getOrderById } from '../../../../lib/db';
import { isAuthorizedForOrder } from '../../../../lib/report-authorization';
import {
  BrowserlessConfigError,
  getOrCreateReportDownloadUrl,
  PdfRenderConcurrencyError,
  ReportGenerationError
} from '../../../../lib/report-download';
import { REPORT_UNAVAILABLE_ERROR } from '../../../../lib/constants';

const requestSchema = z
  .object({
    orderId: z.string().uuid()
  })
  .strict();

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'report',
    limit: 5,
    window: '1 m',
    mode: 'fail-closed'
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

  const isAuthorized = await isAuthorizedForOrder(request, order);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (order.status !== 'paid') {
    return NextResponse.json({ error: 'Order not paid.' }, { status: 403 });
  }

  try {
    const { url, cached } = await getOrCreateReportDownloadUrl({
      order,
      ttlSeconds: 300
    });

    logInfo('Report generated for access.', { orderId: order.id, cached });
    return NextResponse.json({ url, cached });
  } catch (error) {
    if (error instanceof PdfRenderConcurrencyError) {
      return NextResponse.json(
        { error: 'Report generation busy. Try again shortly.' },
        { status: 429, headers: { 'Retry-After': '15' } }
      );
    }

    if (error instanceof ReportGenerationError && error.code === 'RESULT_NOT_FOUND') {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }

    if (error instanceof BrowserlessConfigError) {
      logError('Browserless configuration error for report generation.', {
        orderId: order.id,
        message: error.message
      });
      return NextResponse.json({ error: REPORT_UNAVAILABLE_ERROR }, { status: 503 });
    }

    logError('Report generation failed.', { orderId: order.id, error });
    return NextResponse.json({ error: REPORT_UNAVAILABLE_ERROR }, { status: 503 });
  }
}
