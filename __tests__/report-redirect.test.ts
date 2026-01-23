import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REPORT_UNAVAILABLE_ERROR } from '../lib/constants';
import { GET } from '../src/app/r/[orderId]/route';

const ORDER_ID = '22222222-2222-2222-2222-222222222222';

const getOrderByIdMock = vi.fn();
const getOrCreateReportDownloadUrlMock = vi.fn();
const verifyReportAccessTokenMock = vi.fn();

vi.mock('../lib/db', () => ({
  getOrderById: (...args: unknown[]) => getOrderByIdMock(...args)
}));

vi.mock('../lib/report-download', () => ({
  getOrCreateReportDownloadUrl: (...args: unknown[]) => getOrCreateReportDownloadUrlMock(...args),
  BrowserlessConfigError: class BrowserlessConfigError extends Error {},
  PdfRenderConcurrencyError: class PdfRenderConcurrencyError extends Error {},
  ReportGenerationError: class ReportGenerationError extends Error {}
}));

vi.mock('../lib/report-access', () => ({
  verifyReportAccessToken: (...args: unknown[]) => verifyReportAccessTokenMock(...args)
}));

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn()
}));

describe('/r/:orderId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        created_at: new Date().toISOString(),
        response_id: null,
        email: 'guest@example.com',
        user_id: null,
        report_access_token_hash: 'hashed-token'
      },
      error: null
    });
    verifyReportAccessTokenMock.mockReturnValue(true);
    getOrCreateReportDownloadUrlMock.mockRejectedValue(new Error('Boom'));
  });

  it('returns JSON when Accept requests application/json', async () => {
    const response = await GET(
      new Request(`http://localhost/r/${ORDER_ID}?token=good-token`, {
        headers: { accept: 'application/json' }
      }),
      { params: Promise.resolve({ orderId: ORDER_ID }) }
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: REPORT_UNAVAILABLE_ERROR });
  });

  it('redirects to the error page for HTML requests', async () => {
    const response = await GET(
      new Request(`http://localhost/r/${ORDER_ID}?token=good-token`, {
        headers: { accept: 'text/html' }
      }),
      { params: Promise.resolve({ orderId: ORDER_ID }) }
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/retrieve-report?error=report_generation_unavailable'
    );
  });
});
