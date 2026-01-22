import { Resend } from 'resend';

export type ReportEmailPayload = {
  orderId: string;
  email: string;
  reportUrl: string;
  attachmentUrl?: string;
  attachmentFilename?: string;
};

type ResendAttachment = {
  filename?: string;
  path: string;
};

type ResendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: ResendAttachment[];
};

type ResendConfig = { readonly resendApiKey: string; readonly emailFrom: string };

const shouldSkipEmail = () => process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === '1';
const getOverrideRecipient = () => process.env.RESEND_OVERRIDE_TO;

const getResendConfig = (() => {
  let resendConfig: ResendConfig | null = null;

  return (): ResendConfig => {
    if (resendConfig) {
      return resendConfig;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY.');
    }

    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error('Missing EMAIL_FROM.');
    }

    resendConfig = { resendApiKey, emailFrom };
    return resendConfig;
  };
})();

const getResendClient = (() => {
  let client: Resend | null = null;

  return (apiKey: string) => {
    if (!client) {
      client = new Resend(apiKey);
    }
    return client;
  };
})();

const sendResendEmail = async ({ to, subject, html, text, attachments }: ResendEmailPayload) => {
  if (shouldSkipEmail()) {
    console.info('Resend email skipped in test mode.', { to, subject });
    return { ok: true as const };
  }

  const { resendApiKey, emailFrom } = getResendConfig();
  const resend = getResendClient(resendApiKey);
  const overrideTo = getOverrideRecipient();
  const resolvedTo = overrideTo ?? to;
  if (overrideTo) {
    console.info('Resend override active. Redirecting email recipient.', {
      overrideTo,
      originalTo: to
    });
  }
  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: resolvedTo,
    subject,
    html,
    text,
    attachments
  });

  if (error) {
    const message = error.message ?? 'Unknown error';
    if (message.includes('testing emails')) {
      console.warn(
        'Verify a domain in Resend and set EMAIL_FROM to that domain, or set RESEND_OVERRIDE_TO for testing.'
      );
    }
    throw new Error(`Resend API error: ${message}`);
  }

  return { ok: true as const, id: data?.id };
};

export async function sendReportEmail(payload: ReportEmailPayload) {
  const subject = 'Your TraitHarbor report is ready';
  const hasAttachment = Boolean(payload.attachmentUrl);
  const text = [
    'Your report is ready.',
    '',
    `You can also retrieve your report here: ${payload.reportUrl}`,
    '',
    `Order ID: ${payload.orderId}`
  ].join('\n');
  const html = [
    `<p>Your report is ready${hasAttachment ? '. Your PDF is attached.' : ''}</p>`,
    `<p>If you need another copy later, visit <a href="${payload.reportUrl}">${payload.reportUrl}</a>.</p>`,
    `<p>Order ID: ${payload.orderId}</p>`
  ].join('');
  const filename =
    payload.attachmentFilename ?? `TraitHarbor-Report-${payload.orderId.slice(0, 8)}.pdf`;
  const attachments = hasAttachment
    ? [{ filename, path: payload.attachmentUrl as string }]
    : undefined;

  return sendResendEmail({
    to: payload.email,
    subject,
    html,
    text,
    attachments
  });
}

export type ReportAccessLinkEmailPayload = {
  email: string;
  accessUrl: string;
  requestUrl: string;
  expiresInMinutes: number;
};

export async function sendReportAccessLinkEmail(payload: ReportAccessLinkEmailPayload) {
  const subject = 'Your secure TraitHarbor access link';
  const text = [
    'Use this secure link to access your reports:',
    payload.accessUrl,
    '',
    `This link expires in ${payload.expiresInMinutes} minutes.`,
    `If this link has expired, request another here: ${payload.requestUrl}`
  ].join('\n');
  const html = [
    '<p>Use this secure link to access your reports:</p>',
    `<p><a href="${payload.accessUrl}">Access your report</a></p>`,
    `<p>This link expires in ${payload.expiresInMinutes} minutes.</p>`,
    `<p>If this link has expired, request another here: <a href="${payload.requestUrl}">${payload.requestUrl}</a></p>`
  ].join('');

  return sendResendEmail({
    to: payload.email,
    subject,
    html,
    text
  });
}
