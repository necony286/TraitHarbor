import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getOrderById } from '../../../../../../lib/db';
import { logError, logInfo, logWarn } from '../../../../../../lib/logger';
import { enforceRateLimit } from '../../../../../../lib/rate-limit';
import { GUEST_SESSION_COOKIE_NAME, verifyGuestSessionCookie } from '../../../../../../lib/guest-session';
import { getOrCreateReportDownloadUrl, PdfRenderConcurrencyError, ReportGenerationError } from '../../../../../../lib/report-download';

const orderIdSchema = z.string().uuid();

const SIGNED_URL_TTL_SECONDS = 300;

const isAuthorizedForOrder = async (request: Request, order: { user_id?: string | null; email?: string | null }) => {
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && order.user_id && order.user_id === headerUserId) {
    return true;
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;
  const session = verifyGuestSessionCookie(sessionValue);
  if (!session || !order.email) {
    return false;
  }

  return session.email.toLowerCase() === order.email.toLowerCase();
};

export const runtime = 'nodejs';

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'report-download-url',
    limit: 10,
    window: '1 m',
    mode: 'fail-open'
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { orderId } = await context.params;
  if (!orderIdSchema.safeParse(orderId).success) {
    return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 });
  }

  let order;
  try {
    const { data, error } = await getOrderById({ orderId });
    if (error) {
      logWarn('Unable to find order for report download.', { orderId, error });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (!data) {
      logWarn('Order not found for report download.', { orderId });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    order = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report download.', { error });
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }

  const isAuthorized = await isAuthorizedForOrder(request, order);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (order.status !== 'paid') {
    return NextResponse.json({ error: 'Order not eligible for download.' }, { status: 403 });
  }

  try {
    const { url } = await getOrCreateReportDownloadUrl({
      order,
      ttlSeconds: SIGNED_URL_TTL_SECONDS
    });

    logInfo('Report download URL issued.', { orderId: order.id });
    return NextResponse.json({ url, expiresInSeconds: SIGNED_URL_TTL_SECONDS });
  } catch (error) {
    if (error instanceof PdfRenderConcurrencyError) {
      return NextResponse.json({ error: 'Report generation busy. Try again shortly.' }, { status: 429 });
    }

    if (error instanceof ReportGenerationError) {
      if (error.code === 'RESULT_NOT_FOUND') {
        return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
      }

      if (error.code === 'RESULT_INVALID') {
        return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
      }
    }

    logError('Report download URL generation failed.', { orderId: order.id, error });
    return NextResponse.json({ error: 'Unable to generate report.' }, { status: 500 });
  }
}
