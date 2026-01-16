export type ReportEmailPayload = {
  orderId: string;
  email: string;
  reportUrl: string;
};

export async function sendReportEmail(payload: ReportEmailPayload) {
  console.info('Email delivery stub invoked.', {
    orderId: payload.orderId,
    email: payload.email
  });

  return { ok: true };
}

export type ReportAccessLinkEmailPayload = {
  email: string;
  accessUrl: string;
  requestUrl: string;
};

export async function sendReportAccessLinkEmail(payload: ReportAccessLinkEmailPayload) {
  console.info('Report access email stub invoked.', {
    email: payload.email,
    accessUrl: payload.accessUrl,
    requestUrl: payload.requestUrl
  });

  return { ok: true };
}
