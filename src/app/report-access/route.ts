import { NextResponse } from 'next/server';
import { createGuestSessionCookie, GUEST_SESSION_COOKIE_NAME } from '../../../lib/guest-session';
import { getReportAccessLinkByHash, markReportAccessLinkUsed } from '../../../lib/db';
import { hashReportAccessToken, isReportAccessLinkActive } from '../../../lib/report-access';
import { logError, logWarn } from '../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const redirectToRetrieve = () => NextResponse.redirect(new URL('/retrieve-report', request.url));
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return redirectToRetrieve();
  }

  let tokenHash = '';
  try {
    tokenHash = hashReportAccessToken(token);
  } catch (error) {
    logError('Failed to hash report access token.', { error });
    return redirectToRetrieve();
  }

  let link;
  try {
    const { data, error } = await getReportAccessLinkByHash(tokenHash);
    if (error) {
      logWarn('Failed to lookup report access link.', { error });
      return redirectToRetrieve();
    }
    link = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report access lookup.', { error });
    return redirectToRetrieve();
  }

  if (!link || !isReportAccessLinkActive({ expiresAt: link.expires_at, usedAt: link.used_at })) {
    return redirectToRetrieve();
  }

  try {
    const { data, error } = await markReportAccessLinkUsed(link.id);
    if (error || !data) {
      logWarn('Failed to mark report access link as used.', { linkId: link.id, error });
      return redirectToRetrieve();
    }
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report access link update.', { error });
    return redirectToRetrieve();
  }

  let guestCookie;
  try {
    guestCookie = createGuestSessionCookie(link.email);
  } catch (error) {
    logError('Failed to create guest session cookie.', { error });
    return redirectToRetrieve();
  }

  const response = NextResponse.redirect(new URL('/my-reports', request.url));
  response.cookies.set(GUEST_SESSION_COOKIE_NAME, guestCookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: guestCookie.maxAgeSeconds,
    expires: guestCookie.expiresAt
  });

  return response;
}
