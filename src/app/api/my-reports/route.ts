import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getPaidOrdersByEmail, getPaidOrdersByUserId } from '../../../../lib/db';
import { logError, logWarn } from '../../../../lib/logger';
import { GUEST_SESSION_COOKIE_NAME, verifyGuestSessionCookie } from '../../../../lib/guest-session';

const userIdSchema = z.string().uuid();

const serializeOrder = (order: {
  id: string;
  status: string;
  created_at: string;
  paid_at?: string | null;
  report_file_key?: string | null;
}) => ({
  id: order.id,
  status: order.status,
  createdAt: order.created_at,
  paidAt: order.paid_at ?? null,
  reportReady: Boolean(order.report_file_key)
});

const respondWithPaidOrders = async ({
  fetchOrders,
  lookupLabel,
  logContext
}: {
  fetchOrders: () => ReturnType<typeof getPaidOrdersByUserId>;
  lookupLabel: string;
  logContext: Record<string, unknown>;
}) => {
  try {
    const { data, error } = await fetchOrders();
    if (error) {
      logWarn(`Failed to lookup paid orders for ${lookupLabel}.`, { ...logContext, error });
      return NextResponse.json({ error: 'Unable to fetch reports.' }, { status: 500 });
    }
    return NextResponse.json({ orders: (data ?? []).map(serializeOrder) });
  } catch (error) {
    logError(`Failed to initialize Supabase admin client for ${lookupLabel} report lookup.`, { ...logContext, error });
    return NextResponse.json({ error: 'Unable to fetch reports.' }, { status: 500 });
  }
};

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const headerUserId = request.headers.get('x-user-id');
  const userId = headerUserId && userIdSchema.safeParse(headerUserId).success ? headerUserId : null;

  if (userId) {
    return respondWithPaidOrders({
      fetchOrders: () => getPaidOrdersByUserId(userId),
      lookupLabel: 'user',
      logContext: { userId }
    });
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;
  const session = verifyGuestSessionCookie(sessionValue);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return respondWithPaidOrders({
    fetchOrders: () => getPaidOrdersByEmail(session.email),
    lookupLabel: 'guest',
    logContext: { email: session.email }
  });
}
