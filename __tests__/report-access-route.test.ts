import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GUEST_SESSION_COOKIE_NAME } from '../lib/guest-session';

const getReportAccessLinkByHashMock = vi.fn();
const markReportAccessLinkUsedMock = vi.fn();
const hashReportAccessTokenMock = vi.fn(() => 'hashed-token');
const isReportAccessLinkActiveMock = vi.fn(() => true);

vi.mock('../lib/db', () => ({
  getReportAccessLinkByHash: (...args: unknown[]) => getReportAccessLinkByHashMock(...args),
  markReportAccessLinkUsed: (...args: unknown[]) => markReportAccessLinkUsedMock(...args)
}));

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn()
}));

vi.mock('../lib/report-access', () => ({
  hashReportAccessToken: (...args: unknown[]) => hashReportAccessTokenMock(...args),
  isReportAccessLinkActive: (...args: unknown[]) => isReportAccessLinkActiveMock(...args)
}));

import { GET } from '../src/app/report-access/route';

describe('/report-access', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env, GUEST_SESSION_SECRET: 'test-secret' };
  });

  afterEach(() => {
    process.env = env;
  });

  it('redirects when the token is invalid', async () => {
    getReportAccessLinkByHashMock.mockResolvedValue({ data: null, error: null });

    const response = await GET(new Request('http://localhost/report-access?token=bad-token'));

    expect(hashReportAccessTokenMock).toHaveBeenCalledWith('bad-token');
    expect(response.headers.get('location')).toBe('http://localhost/retrieve-report');
  });

  it('issues a guest cookie for a valid access link', async () => {
    getReportAccessLinkByHashMock.mockResolvedValue({
      data: {
        id: 'link-1',
        email: 'guest@example.com',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        used_at: null
      },
      error: null
    });

    markReportAccessLinkUsedMock.mockResolvedValue({
      data: {
        id: 'link-1',
        email: 'guest@example.com',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        used_at: new Date().toISOString()
      },
      error: null
    });

    const response = await GET(new Request('http://localhost/report-access?token=good-token'));

    expect(response.headers.get('location')).toBe('http://localhost/my-reports');
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain(GUEST_SESSION_COOKIE_NAME);
    expect(hashReportAccessTokenMock).toHaveBeenCalledWith('good-token');
  });
});
