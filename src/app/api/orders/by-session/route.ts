import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOrderByProviderSessionId } from '../../../../../lib/db';
import { logError, logWarn } from '../../../../../lib/logger';
import { enforceRateLimit } from '../../../../../lib/rate-limit';

const sessionIdSchema = z.string().uuid();
const FIXTURE_RESULT_ID = '11111111-1111-1111-1111-111111111111';

const serializeOrder = (order: {
  id: string;
  status: string;
  response_id?: string | null;
  created_at: string;
  paid_at?: string | null;
  email?: string | null;
  user_id?: string | null;
  report_file_key?: string | null;
  provider_session_id?: string | null;
}) => ({
  id: order.id,
  status: order.status,
  resultId: order.response_id ?? null,
  createdAt: order.created_at,
  paidAt: order.paid_at ?? null,
  email: order.email ?? null,
  userId: order.user_id ?? null,
  reportReady: Boolean(order.report_file_key),
  providerSessionId: order.provider_session_id ?? null
});

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'orders-by-session',
    limit: 15,
    window: '1 m',
    mode: 'fail-open'
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId || !sessionIdSchema.safeParse(sessionId).success) {
    return NextResponse.json({ error: 'Invalid session id.' }, { status: 400 });
  }

  const useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (useFixture && (!supabaseUrl || !supabaseServiceKey)) {
    return NextResponse.json({
      order: serializeOrder({
        id: sessionId,
        status: 'paid',
        response_id: FIXTURE_RESULT_ID,
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        email: 'guest@example.com',
        user_id: null,
        report_file_key: 'fixture-report',
        provider_session_id: sessionId
      })
    });
  }

  try {
    const { data, error } = await getOrderByProviderSessionId(sessionId);
    if (error) {
      logWarn('Failed to lookup order by session id.', { sessionId, error });
      return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ order: serializeOrder(data) });
  } catch (error) {
    logError('Failed to initialize Supabase admin client for order lookup by session.', { sessionId, error });
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }
}
