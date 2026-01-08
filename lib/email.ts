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
