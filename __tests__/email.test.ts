import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.fn();
const resendConstructorMock = vi.fn();

class ResendMock {
  emails = {
    send: sendMock
  };

  constructor(...args: unknown[]) {
    resendConstructorMock(...args);
  }
}

vi.mock('resend', () => ({
  Resend: ResendMock
}));

const reportPayload = {
  orderId: 'order_123',
  email: 'user@example.com',
  reportUrl: 'https://example.com/retrieve-report',
  attachmentUrl: 'https://example.com/report.pdf'
};

describe('email config validation', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...env, NODE_ENV: 'development' };
  });

  afterEach(() => {
    process.env = env;
  });

  it.each([
    {
      envVar: 'RESEND_API_KEY',
      setup: () => {
        process.env = { ...env, NODE_ENV: 'development', EMAIL_FROM: 'sender@example.com' };
        delete process.env.RESEND_API_KEY;
      }
    },
    {
      envVar: 'EMAIL_FROM',
      setup: () => {
        process.env = { ...env, NODE_ENV: 'development', RESEND_API_KEY: 'test-key' };
        delete process.env.EMAIL_FROM;
      }
    }
  ])('throws when $envVar is missing', async ({ envVar, setup }) => {
    setup();
    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).rejects.toThrow(`Missing ${envVar}.`);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('caches resend configuration after first load', async () => {
    process.env = { ...env, NODE_ENV: 'development', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'sender@example.com' };
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true, id: 'email_123' });

    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true, id: 'email_123' });

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(resendConstructorMock).toHaveBeenCalledWith('test-key');
  });

  it('skips sending in test mode', async () => {
    process.env = { ...env, NODE_ENV: 'test' };
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
  });
});
