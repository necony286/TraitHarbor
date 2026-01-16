import { createHmac } from 'crypto';
import { z } from 'zod';
import { timingSafeEquals } from './signature';

export const GUEST_SESSION_COOKIE_NAME = 'traitharbor_guest_report_access';

type GuestSessionPayload = {
  email: string;
  exp: number;
};

const guestSessionPayloadSchema = z.object({
  email: z.string(),
  exp: z.number()
});

const COOKIE_TTL_DAYS = 7;

const getGuestSessionSecret = () => {
  const secret = process.env.GUEST_SESSION_SECRET;
  if (!secret) {
    throw new Error('GUEST_SESSION_SECRET is required to sign guest sessions.');
  }
  return secret;
};

const encodePayload = (payload: GuestSessionPayload) => Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

const decodePayload = (value: string): GuestSessionPayload | null => {
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);
    const result = guestSessionPayloadSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

const signPayload = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('hex');

export const createGuestSessionCookie = (email: string, ttlDays = COOKIE_TTL_DAYS) => {
  const normalizedEmail = email.toLowerCase();
  const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  const payload = encodePayload({ email: normalizedEmail, exp: expiresAt });
  const signature = signPayload(payload, getGuestSessionSecret());

  return {
    value: `${payload}.${signature}`,
    expiresAt: new Date(expiresAt),
    maxAgeSeconds: ttlDays * 24 * 60 * 60
  };
};

export const verifyGuestSessionCookie = (value?: string | null) => {
  if (!value) return null;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload, getGuestSessionSecret());
  if (!timingSafeEquals(signature, expectedSignature)) {
    return null;
  }

  const decoded = decodePayload(payload);
  if (!decoded) return null;

  if (decoded.exp <= Date.now()) {
    return null;
  }

  return { email: decoded.email, expiresAt: new Date(decoded.exp) };
};
