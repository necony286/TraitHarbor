export type ReportEmailPayload = {
  orderId: string;
  email: string;
  reportUrl: string;
};

type ResendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';

const getResendApiKey = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY.');
  }
  return apiKey;
};

const getEmailFrom = () => {
  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    throw new Error('Missing EMAIL_FROM.');
  }
  return emailFrom;
};

const sendResendEmail = async ({ to, subject, html, text }: ResendEmailPayload) => {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend API error: ${response.status} ${message}`);
  }

  return response.json();
};

export async function sendReportEmail(payload: ReportEmailPayload) {
  const subject = 'Your Trait Harbor report is ready';
  const text = `Your report is ready.\n\nDownload your report any time: ${payload.reportUrl}\n\nOrder ID: ${payload.orderId}`;
  const html = `
    <p>Your report is ready.</p>
    <p><a href="${payload.reportUrl}">Download your report</a></p>
    <p>This link stays active and will always generate a fresh download.</p>
    <p>Order ID: ${payload.orderId}</p>
  `;

  return sendResendEmail({
    to: payload.email,
    subject,
    html,
    text
  });
}

export type ReportAccessLinkEmailPayload = {
  email: string;
  accessUrl: string;
  requestUrl: string;
};

export async function sendReportAccessLinkEmail(payload: ReportAccessLinkEmailPayload) {
  const subject = 'Your Trait Harbor report access link';
  const text = `Use this secure link to access your reports:\n${payload.accessUrl}\n\nIf this link has expired, request another here: ${payload.requestUrl}`;
  const html = `
    <p>Use this secure link to access your reports:</p>
    <p><a href="${payload.accessUrl}">Access your report</a></p>
    <p>If this link has expired, request another here: <a href="${payload.requestUrl}">${payload.requestUrl}</a></p>
  `;

  return sendResendEmail({
    to: payload.email,
    subject,
    html,
    text
  });
}
