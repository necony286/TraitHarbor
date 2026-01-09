import crypto from 'crypto';

type SignatureParts = {
  scheme: 'h1' | 'v1';
  timestamp?: string;
  signature: string;
};

const parseSignatureHeader = (header: string): SignatureParts | null => {
  const parts = header.split(';').map((part) => part.trim());
  const map = new Map<string, string>();

  parts.forEach((part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      map.set(key, value);
    }
  });

  const timestamp = map.get('ts') ?? map.get('t');
  const h1Signature = map.get('h1');
  const v1Signature = map.get('v1');

  if (h1Signature) {
    if (!timestamp) {
      return null;
    }
    return { scheme: 'h1', timestamp, signature: h1Signature };
  }

  if (v1Signature) {
    return { scheme: 'v1', signature: v1Signature };
  }

  return null;
};

const createHmac = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

const timingSafeEquals = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');

  if (aBuffer.length !== bBuffer.length) {
    crypto.timingSafeEqual(bBuffer, bBuffer);
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

export const createPaddleSignatureHeader = (
  body: string,
  secret: string,
  timestamp: number | string = Date.now()
): string => {
  const ts = typeof timestamp === 'number' ? Math.floor(timestamp).toString() : timestamp;
  const signature = createHmac(`${ts}:${body}`, secret);
  return `ts=${ts};h1=${signature}`;
};

export const verifyPaddleSignature = (body: string, header: string | null, secret: string): boolean => {
  if (!header) return false;
  const parsed = parseSignatureHeader(header);
  if (!parsed) return false;

  if (parsed.scheme === 'h1') {
    const eventTimestamp = Number(parsed.timestamp);
    if (!Number.isFinite(eventTimestamp)) {
      return false;
    }

    const timestampMs = eventTimestamp >= 1_000_000_000_000 ? eventTimestamp : eventTimestamp * 1000;
    const toleranceMs = 5 * 60 * 1000;

    if (Math.abs(Date.now() - timestampMs) > toleranceMs) {
      return false;
    }

    const expectedSignature = createHmac(`${parsed.timestamp}:${body}`, secret);
    return timingSafeEquals(parsed.signature, expectedSignature);
  }

  if (parsed.scheme === 'v1') {
    const expectedSignature = createHmac(body, secret);
    return timingSafeEquals(parsed.signature, expectedSignature);
  }

  return false;
};
