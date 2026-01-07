import crypto from 'crypto';

type SignatureParts = {
  timestamp: string;
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
  const signature = map.get('h1') ?? map.get('v1');

  if (!timestamp || !signature) {
    return null;
  }

  return { timestamp, signature };
};

const createHmac = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

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

  const primary = createHmac(`${parsed.timestamp}:${body}`, secret);
  const legacy = createHmac(body, secret);

  return parsed.signature === primary || parsed.signature === legacy;
};
