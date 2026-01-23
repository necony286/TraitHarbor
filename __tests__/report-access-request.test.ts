import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getPaidOrdersByEmailMock = vi.fn();
const createReportAccessLinkMock = vi.fn();
const sendReportAccessLinkEmailMock = vi.fn();
const enforceRateLimitMock = vi.fn().mockResolvedValue(null);
const generateReportAccessTokenMock = vi.fn(() => 'raw-token');
const hashReportAccessTokenMock = vi.fn(() => 'hashed-token');

vi.mock('../lib/db', () => ({
  getPaidOrdersByEmail: (...args: unknown[]) => getPaidOrdersByEmailMock(...args),
  createReportAccessLink: (...args: unknown[]) => createReportAccessLinkMock(...args)
}));

vi.mock('../lib/email', () => ({
  sendReportAccessLinkEmail: (...args: unknown[]) => sendReportAccessLinkEmailMock(...args)
}));

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn()
}));

vi.mock('../lib/rate-limit', () => ({
  enforceRateLimit: (...args: unknown[]) => enforceRateLimitMock(...args),
  getClientIdentifier: vi.fn(() => '127.0.0.1')
}));

vi.mock('../lib/report-access', () => ({
  generateReportAccessToken: (...args: unknown[]) => generateReportAccessTokenMock(...args),
  hashReportAccessToken: (...args: unknown[]) => hashReportAccessTokenMock(...args)
}));

import { POST } from '../src/app/api/report-access/request-link/route';

describe('/api/report-access/request-link', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env, NODE_ENV: 'test', NEXT_PUBLIC_SITE_URL: 'http://localhost' };
  });

  afterEach(() => {
    process.env = env;
  });

  it('does not create a link when no paid orders exist', async () => {
    getPaidOrdersByEmailMock.mockResolvedValue({ data: [], error: null });

    const response = await POST(
      new Request('http://localhost/api/report-access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest@example.com' })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      message: 'If a paid report matches that email, a secure access link will be sent shortly.'
    });
    expect(createReportAccessLinkMock).not.toHaveBeenCalled();
    expect(sendReportAccessLinkEmailMock).not.toHaveBeenCalled();
  });

  it('stores only a hashed token and returns the access URL in test env', async () => {
    getPaidOrdersByEmailMock.mockResolvedValue({
      data: [
        {
          id: 'order-123',
          status: 'paid',
          created_at: new Date().toISOString(),
          paid_at: new Date().toISOString()
        }
      ],
      error: null
    });

    createReportAccessLinkMock.mockResolvedValue({ data: { id: 'link-1' }, error: null });

    const response = await POST(
      new Request('http://localhost/api/report-access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest@example.com' })
      })
    );

    expect(createReportAccessLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'guest@example.com',
        orderId: 'order-123',
        tokenHash: 'hashed-token'
      })
    );
    expect(createReportAccessLinkMock.mock.calls[0]?.[0]).not.toHaveProperty('token', 'raw-token');

    await expect(response.json()).resolves.toMatchObject({
      accessUrl: 'http://localhost/report-access?token=raw-token'
    });

    expect(sendReportAccessLinkEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'guest@example.com',
        accessUrl: 'http://localhost/report-access?token=raw-token',
        expiresInMinutes: 30
      })
    );
  });

  it('returns a server error when the email send fails', async () => {
    getPaidOrdersByEmailMock.mockResolvedValue({
      data: [
        {
          id: 'order-456',
          status: 'paid',
          created_at: new Date().toISOString(),
          paid_at: new Date().toISOString()
        }
      ],
      error: null
    });

    createReportAccessLinkMock.mockResolvedValue({ data: { id: 'link-2' }, error: null });
    sendReportAccessLinkEmailMock.mockRejectedValue(new Error('Resend error'));

    const response = await POST(
      new Request('http://localhost/api/report-access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest@example.com' })
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      message: 'Unable to send report access email right now.'
    });
  });
});
