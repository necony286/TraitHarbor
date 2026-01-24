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
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...env, NODE_ENV: 'development' };
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllGlobals();
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
    const pdfBytes = Uint8Array.from([0x25, 0x50, 0x44, 0x46]);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': String(pdfBytes.length) }),
      arrayBuffer: async () => pdfBytes.buffer
    });
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true, id: 'email_123' });

    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true, id: 'email_123' });

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(resendConstructorMock).toHaveBeenCalledWith('test-key');
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            filename: expect.stringMatching(/\.pdf$/),
            content: Buffer.from(pdfBytes).toString('base64')
          })
        ]
      })
    );
  });

  it('skips sending in test mode', async () => {
    process.env = { ...env, NODE_ENV: 'test' };
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a report access link email with the expected content', async () => {
    process.env = { ...env, NODE_ENV: 'development', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'sender@example.com' };
    sendMock.mockResolvedValue({ data: { id: 'email_456' }, error: null });

    const { sendReportAccessLinkEmail } = await import('../lib/email');

    await expect(
      sendReportAccessLinkEmail({
        email: 'guest@example.com',
        accessUrl: 'https://trait-harbor.com/r/raw-token',
        requestUrl: 'https://trait-harbor.com/retrieve-report',
        expiresInMinutes: 30
      })
    ).resolves.toEqual({ ok: true, id: 'email_456' });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
        to: 'guest@example.com',
        subject: 'Your secure TraitHarbor access link',
        html: expect.stringContaining('https://trait-harbor.com/r/raw-token'),
        text: expect.stringContaining('https://trait-harbor.com/r/raw-token')
      })
    );
  });

  it('logs a warning and sends email without attachment when content-length exceeds max bytes', async () => {
    process.env = { ...env, NODE_ENV: 'development', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'sender@example.com' };
    const { MAX_EMAIL_ATTACHMENT_BYTES } = await import('../lib/email');
    const oversizedLength = MAX_EMAIL_ATTACHMENT_BYTES + 1;
    const arrayBufferMock = vi.fn();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': String(oversizedLength) }),
      arrayBuffer: arrayBufferMock
    });
    sendMock.mockResolvedValue({ data: { id: 'email_789' }, error: null });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true, id: 'email_789' });

    expect(arrayBufferMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to fetch PDF for email attachment; sending link-only.',
      expect.objectContaining({
        orderId: reportPayload.orderId,
        error: expect.stringMatching(/exceeds.*${MAX_EMAIL_ATTACHMENT_BYTES}/)
      })
    );
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: undefined
      })
    );
    warnSpy.mockRestore();
  });

  it('logs a warning and sends email without attachment when downloaded PDF exceeds max bytes', async () => {
    process.env = { ...env, NODE_ENV: 'development', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'sender@example.com' };
    const { MAX_EMAIL_ATTACHMENT_BYTES } = await import('../lib/email');
    const maxBytes = MAX_EMAIL_ATTACHMENT_BYTES;
    const pdfBytes = new Uint8Array(maxBytes + 1);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': String(maxBytes) }),
      arrayBuffer: async () => pdfBytes.buffer
    });
    sendMock.mockResolvedValue({ data: { id: 'email_101' }, error: null });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { sendReportEmail } = await import('../lib/email');

    await expect(sendReportEmail(reportPayload)).resolves.toEqual({ ok: true, id: 'email_101' });

    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to fetch PDF for email attachment; sending link-only.',
      expect.objectContaining({
        orderId: reportPayload.orderId,
        error: expect.stringMatching(/exceeds.*${MAX_EMAIL_ATTACHMENT_BYTES}/)
      })
    );
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: undefined
      })
    );
    warnSpy.mockRestore();
  });
});
