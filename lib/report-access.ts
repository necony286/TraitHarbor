import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const DEFAULT_TOKEN_BYTES = 32;

export const getReportAccessTokenPepper = () => {
  const pepper = process.env.REPORT_ACCESS_TOKEN_PEPPER;
  if (!pepper) {
    throw new Error('REPORT_ACCESS_TOKEN_PEPPER is required to hash report access tokens.');
  }
  return pepper;
};

export const generateReportAccessToken = (bytes = DEFAULT_TOKEN_BYTES) => {
  return randomBytes(bytes).toString('base64url');
};

export const hashReportAccessToken = (token: string, pepper: string = getReportAccessTokenPepper()) => {
  return createHmac('sha256', pepper).update(token).digest('hex');
};

export const verifyReportAccessToken = (
  token: string,
  tokenHash: string,
  pepper: string = getReportAccessTokenPepper()
) => {
  const candidate = hashReportAccessToken(token, pepper);
  const candidateBuffer = Buffer.from(candidate, 'hex');
  const hashBuffer = Buffer.from(tokenHash, 'hex');
  if (candidateBuffer.length !== hashBuffer.length) {
    return false;
  }
  return timingSafeEqual(candidateBuffer, hashBuffer);
};

type ReportAccessLinkStatus = {
  expiresAt: string | Date;
  usedAt?: string | Date | null;
  now?: Date;
};

export const isReportAccessLinkActive = ({ expiresAt, usedAt, now = new Date() }: ReportAccessLinkStatus) => {
  if (usedAt) {
    return false;
  }
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return expiry.getTime() > now.getTime();
};
