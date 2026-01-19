import { Resend } from 'resend';

export type ReportEmailPayload = {
  orderId: string;
  email: string;
  reportUrl: string;
  pdfBase64: string;
  filename?: string;
};

type ResendAttachment = {
  filename: string;
  content: string;
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
  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    html,
    text,
    attachments
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  return { ok: true as const, id: data?.id };
};

export async function sendReportEmail(payload: ReportEmailPayload) {
  const subject = 'Your TraitHarbor report is ready';
  const text = `Your report is ready.\n\nYou can also retrieve your report here: ${payload.reportUrl}\n\nOrder ID: ${payload.orderId}`;
  const html = [
    '<p>Your report is ready. Your PDF is attached.</p>',
    `<p>If you need another copy later, visit <a href="${payload.reportUrl}">${payload.reportUrl}</a>.</p>`,
    `<p>Order ID: ${payload.orderId}</p>`
  ].join('');
  const filename =
    payload.filename ?? `TraitHarbor-Report-${payload.orderId.slice(0, 8)}.pdf`;

  return sendResendEmail({
    to: payload.email,
    subject,
    html,
    text,
    attachments: [{ filename, content: payload.pdfBase64 }]
  });
}

export type ReportAccessLinkEmailPayload = {
  email: string;
  accessUrl: string;
  requestUrl: string;
};

export async function sendReportAccessLinkEmail(payload: ReportAccessLinkEmailPayload) {
  const subject = 'Your secure TraitHarbor access link';
  const text = `Use this secure link to access your reports:\n${payload.accessUrl}\n\nIf this link has expired, request another here: ${payload.requestUrl}`;
  const html = [
    '<p>Use this secure link to access your reports:</p>',
    `<p><a href="${payload.accessUrl}">Access your report</a></p>`,
    `<p>If this link has expired, request another here: <a href="${payload.requestUrl}">${payload.requestUrl}</a></p>`
  ].join('');

  return sendResendEmail({
    to: payload.email,
    subject,
    html,
    text
  });
}
