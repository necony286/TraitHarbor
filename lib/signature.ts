import crypto from 'crypto';

type SignatureParts =
  | {
      scheme: 'h1';
      timestamp: string;
      signatures: string[];
    }
  | {
      scheme: 'v1';
      signature: string;
    };

const parseSignatureHeader = (header: string): SignatureParts | null => {
  const parts = header.split(';').map((part) => part.trim());
  const map = new Map<string, string>();
  const h1Signatures: string[] = [];

  parts.forEach((part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      if (key === 'h1') {
        h1Signatures.push(value);
      } else {
        map.set(key, value);
      }
    }
  });

  const timestamp = map.get('ts') ?? map.get('t');
  const v1Signature = map.get('v1');

  if (h1Signatures.length > 0) {
    if (!timestamp) {
      return null;
    }
    return { scheme: 'h1', timestamp, signatures: h1Signatures };
  }

  if (v1Signature) {
    return { scheme: 'v1', signature: v1Signature };
  }

  return null;
};

const createHmac = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

export const timingSafeEquals = (a: string, b: string): boolean => {
  const isValidHex = (value: string) => value.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(value);

  const aIsValid = isValidHex(a);
  const bIsValid = isValidHex(b);
  const aBuffer = aIsValid ? Buffer.from(a, 'hex') : Buffer.alloc(0);
  const bBuffer = bIsValid ? Buffer.from(b, 'hex') : Buffer.alloc(0);

  const maxLength = Math.max(aBuffer.length, bBuffer.length, 1);
  const paddedA = Buffer.alloc(maxLength);
  const paddedB = Buffer.alloc(maxLength);

  aBuffer.copy(paddedA);
  bBuffer.copy(paddedB);

  const isEqual = crypto.timingSafeEqual(paddedA, paddedB);
  return aIsValid && bIsValid && aBuffer.length === bBuffer.length && aBuffer.length > 0 && isEqual;
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
    return parsed.signatures.some((signature) => timingSafeEquals(signature, expectedSignature));
  }

  if (parsed.scheme === 'v1') {
    const expectedSignature = createHmac(body, secret);
    return timingSafeEquals(parsed.signature, expectedSignature);
  }

  return false;
};
