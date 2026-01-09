const REPORT_ACCESS_TOKEN_KEY_PREFIX = 'report-access-token';

export const getReportAccessTokenKey = (orderId: string) => `${REPORT_ACCESS_TOKEN_KEY_PREFIX}:${orderId}`;
