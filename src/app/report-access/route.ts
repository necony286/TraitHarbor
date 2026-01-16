import { NextResponse } from 'next/server';
import { createGuestSessionCookie, GUEST_SESSION_COOKIE_NAME } from '../../../lib/guest-session';
import { getReportAccessLinkByHash, markReportAccessLinkUsed } from '../../../lib/db';
import { hashReportAccessToken, isReportAccessLinkActive } from '../../../lib/report-access';
import { logError, logWarn } from '../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/retrieve-report', request.url));
  }

  let tokenHash = '';
  try {
    tokenHash = hashReportAccessToken(token);
  } catch (error) {
    logError('Failed to hash report access token.', { error });
    return NextResponse.redirect(new URL('/retrieve-report', request.url));
  }

  let link;
  try {
    const { data, error } = await getReportAccessLinkByHash(tokenHash);
    if (error) {
      logWarn('Failed to lookup report access link.', { error });
      return NextResponse.redirect(new URL('/retrieve-report', request.url));
    }
    link = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report access lookup.', { error });
    return NextResponse.redirect(new URL('/retrieve-report', request.url));
  }

  if (!link || !isReportAccessLinkActive({ expiresAt: link.expires_at, usedAt: link.used_at })) {
    return NextResponse.redirect(new URL('/retrieve-report', request.url));
  }

  try {
    const { data, error } = await markReportAccessLinkUsed(link.id);
    if (error || !data) {
      logWarn('Failed to mark report access link as used.', { linkId: link.id, error });
      return NextResponse.redirect(new URL('/retrieve-report', request.url));
    }
  } catch (error) {
    logError('Failed to initialize Supabase admin client for report access link update.', { error });
    return NextResponse.redirect(new URL('/retrieve-report', request.url));
  }

  let guestCookie;
  try {
    guestCookie = createGuestSessionCookie(link.email);
  } catch (error) {
    logError('Failed to create guest session cookie.', { error });
    return NextResponse.redirect(new URL('/retrieve-report', request.url));
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
