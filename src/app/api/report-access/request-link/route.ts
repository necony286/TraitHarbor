import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createReportAccessLink, getPaidOrdersByEmail } from '../../../../../lib/db';
import { sendReportAccessLinkEmail } from '../../../../../lib/email';
import { logError, logWarn } from '../../../../../lib/logger';
import { enforceRateLimit, getClientIdentifier } from '../../../../../lib/rate-limit';
import { generateReportAccessToken, hashReportAccessToken } from '../../../../../lib/report-access';
import { absoluteUrl } from '@/lib/siteUrl';

const requestSchema = z
  .object({
    email: z.string().trim().email().max(254)
  })
  .strict();

const TOKEN_TTL_MINUTES = 30;

const GENERIC_RESPONSE = {
  message: 'If a paid report matches that email, a secure access link will be sent shortly.'
};

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'report-access-request',
    limit: 5,
    window: '15 m',
    mode: 'fail-open',
    identifier: `${getClientIdentifier(request)}:${normalizedEmail}`
  });

  if (rateLimitResponse) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  let orders;
  try {
    const { data, error } = await getPaidOrdersByEmail(normalizedEmail);
    if (error) {
      logWarn('Failed to lookup paid orders for report access link.', { email: normalizedEmail, error });
      return NextResponse.json(GENERIC_RESPONSE);
    }
    orders = data ?? [];
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report access lookup.', { error });
    return NextResponse.json(GENERIC_RESPONSE);
  }

  if (orders.length === 0) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  let token = '';
  let tokenHash = '';
  try {
    token = generateReportAccessToken();
    tokenHash = hashReportAccessToken(token);
  } catch (error) {
    logError('Failed to generate report access link token.', { error });
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
  const [latestOrder] = orders;

  try {
    const { error } = await createReportAccessLink({
      email: normalizedEmail,
      orderId: latestOrder.id,
      tokenHash,
      expiresAt
    });
    if (error) {
      logWarn('Failed to store report access link.', { email: normalizedEmail, error });
      return NextResponse.json(GENERIC_RESPONSE);
    }
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report access link creation.', { error });
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const accessUrl = absoluteUrl(`/report-access?token=${encodeURIComponent(token)}`);
  const requestUrl = absoluteUrl('/retrieve-report');

  try {
    await sendReportAccessLinkEmail({
      email: normalizedEmail,
      accessUrl,
      requestUrl
    });
  } catch (error) {
    logWarn('Failed to send report access email.', { email: normalizedEmail, error });
  }

  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === '1') {
    return NextResponse.json({ ...GENERIC_RESPONSE, accessUrl });
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
