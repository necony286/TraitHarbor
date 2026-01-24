import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOrderById } from '../../../../lib/db';
import { logError, logInfo, logWarn } from '../../../../lib/logger';
import { verifyReportAccessToken } from '../../../../lib/report-access';
import {
  BrowserlessConfigError,
  getOrCreateReportDownloadUrl,
  PdfRenderConcurrencyError,
  ReportGenerationError
} from '../../../../lib/report-download';
import { REPORT_UNAVAILABLE_ERROR } from '../../../../lib/constants';

const orderIdSchema = z.string().uuid();

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const redirectToRetrieve = () => NextResponse.redirect(new URL('/retrieve-report', request.url));
  const reportUnavailableRedirect = () =>
    NextResponse.redirect(
      new URL('/retrieve-report?error=report_generation_unavailable', request.url)
    );
  const reportUnavailableJson = () =>
    NextResponse.json({ error: REPORT_UNAVAILABLE_ERROR }, { status: 503 });
  const isNavigationRequest = () => {
    const fetchDest = request.headers.get('sec-fetch-dest');
    const fetchMode = request.headers.get('sec-fetch-mode');
    if (fetchDest === 'document' || fetchMode === 'navigate') {
      return true;
    }
    const accept = request.headers.get('accept')?.toLowerCase() ?? '';
    return accept.includes('text/html');
  };
  const respondReportUnavailable = () =>
    (isNavigationRequest() ? reportUnavailableRedirect() : reportUnavailableJson());
  const respondReportError = (payload: { error: string }, status: number) =>
    (isNavigationRequest() ? reportUnavailableRedirect() : NextResponse.json(payload, { status }));
  let orderId: string;
  try {
    ({ orderId } = await params);
  } catch (error) {
    logError('Failed to resolve orderId from route params', { error });
    return redirectToRetrieve();
  }

  if (!orderIdSchema.safeParse(orderId).success) {
    return redirectToRetrieve();
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return redirectToRetrieve();
  }

  let order;
  try {
    const { data, error } = await getOrderById({ orderId });
    if (error) {
      logWarn('Unable to find order for report redirect.', { orderId, error });
      return redirectToRetrieve();
    }
    if (!data) {
      logWarn('Order not found for report redirect.', { orderId });
      return redirectToRetrieve();
    }
    order = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report redirect.', { error });
    return redirectToRetrieve();
  }

  if (order.status !== 'paid') {
    logWarn('Order not paid for report redirect.', { orderId, status: order.status });
    return redirectToRetrieve();
  }

  if (!order.report_access_token_hash) {
    logWarn('Order missing report access token hash.', { orderId });
    return redirectToRetrieve();
  }

  if (!verifyReportAccessToken(token, order.report_access_token_hash)) {
    logWarn('Invalid report access token.', { orderId });
    return redirectToRetrieve();
  }

  try {
    const { url, cached } = await getOrCreateReportDownloadUrl({
      order,
      ttlSeconds: 300
    });

    logInfo('Report download redirect issued.', { orderId, cached });
    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof PdfRenderConcurrencyError) {
      return respondReportError({ error: 'Report generation busy. Try again shortly.' }, 429);
    }

    if (error instanceof ReportGenerationError && error.code === 'RESULT_NOT_FOUND') {
      return respondReportError({ error: 'Result not found.' }, 404);
    }

    if (error instanceof BrowserlessConfigError) {
      logError('Browserless configuration error for report redirect.', {
        orderId,
        message: error.message
      });
      return respondReportUnavailable();
    }

    logError('Report generation failed for redirect.', { orderId, error });
    return respondReportUnavailable();
  }
}
