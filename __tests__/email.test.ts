import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const reportPayload = {
  orderId: 'order_123',
  email: 'user@example.com',
  reportUrl: 'https://example.com/report.pdf'
};

describe('email config validation', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...env };
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllGlobals();
  });

  it('throws when RESEND_API_KEY is missing', async () => {
    process.env = { ...env, EMAIL_FROM: 'sender@example.com' };
    delete process.env.RESEND_API_KEY;
    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).rejects.toThrow('Missing RESEND_API_KEY.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws when EMAIL_FROM is missing', async () => {
    process.env = { ...env, RESEND_API_KEY: 'test-key' };
    delete process.env.EMAIL_FROM;
    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).rejects.toThrow('Missing EMAIL_FROM.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('caches resend configuration after first load', async () => {
    process.env = { ...env, RESEND_API_KEY: 'test-key', EMAIL_FROM: 'sender@example.com' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_123' })
    });
    vi.stubGlobal('fetch', fetchMock);

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ id: 'email_123' });

    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ id: 'email_123' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key'
        })
      })
    );
  });
});
