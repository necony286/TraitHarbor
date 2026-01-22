import { describe, expect, it } from 'vitest';

import { reportAccessLinkSchema } from '../lib/db';

const baseLink = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'guest@example.com',
  order_id: '22222222-2222-2222-2222-222222222222',
  token_hash: 'hash',
  used_at: null,
  created_at: '2025-01-22T10:11:12+00:00'
};

describe('reportAccessLinkSchema', () => {
  it.each([
    '2025-01-22T10:11:12+00:00',
    '2025-01-22T10:11:12.123+00:00',
    '2025-01-22 10:11:12+00:00'
  ])('accepts expires_at format %s', (expiresAt) => {
    const parsed = reportAccessLinkSchema.safeParse({ ...baseLink, expires_at: expiresAt });
    expect(parsed.success).toBe(true);
  });
});
