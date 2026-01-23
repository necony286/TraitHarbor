import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGuestSessionCookie, GUEST_SESSION_COOKIE_NAME } from '../lib/guest-session';
import { REPORT_UNAVAILABLE_ERROR } from '../lib/constants';
import { ReportGenerationError } from '../lib/report-download';
import { POST } from '../src/app/api/reports/[orderId]/download-url/route';

const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

let cookieValue: string | undefined;

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockImplementation(async () => ({
    get: (name: string) => (name === GUEST_SESSION_COOKIE_NAME && cookieValue ? { value: cookieValue } : undefined)
  }))
}));

const getOrderByIdMock = vi.fn();

vi.mock('../lib/db', () => ({
  getOrderById: (...args: unknown[]) => getOrderByIdMock(...args)
}));

const getOrCreateReportDownloadUrlMock = vi.fn();

vi.mock('../lib/report-download', () => ({
  getOrCreateReportDownloadUrl: (...args: unknown[]) => getOrCreateReportDownloadUrlMock(...args),
  PdfRenderConcurrencyError: class PdfRenderConcurrencyError extends Error {},
  ReportGenerationError: class ReportGenerationError extends Error {}
}));

describe('/api/reports/:orderId/download-url', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env, GUEST_SESSION_SECRET: 'test-secret' };
    cookieValue = undefined;
  });

  afterEach(() => {
    process.env = env;
  });

  it('returns a download URL for a paid order with a verified guest email', async () => {
    const guestCookie = createGuestSessionCookie('guest@example.com');
    cookieValue = guestCookie.value;

    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        created_at: new Date().toISOString(),
        response_id: null,
        email: 'guest@example.com',
        user_id: null
      },
      error: null
    });

    getOrCreateReportDownloadUrlMock.mockResolvedValue({
      url: 'https://example.com/report.pdf'
    });

    const response = await POST(new Request(`http://localhost/api/reports/${ORDER_ID}/download-url`, { method: 'POST' }), {
      params: Promise.resolve({ orderId: ORDER_ID })
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ url: 'https://example.com/report.pdf', expiresInSeconds: 300 });
    expect(getOrCreateReportDownloadUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ttlSeconds: 300,
        order: expect.objectContaining({ id: ORDER_ID })
      })
    );
  });

  it('denies refunded orders even when authorized', async () => {
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'refunded',
        created_at: new Date().toISOString(),
        response_id: null,
        email: 'guest@example.com',
        user_id: USER_ID
      },
      error: null
    });

    const response = await POST(
      new Request(`http://localhost/api/reports/${ORDER_ID}/download-url`, {
        method: 'POST',
        headers: { 'x-user-id': USER_ID }
      }),
      { params: Promise.resolve({ orderId: ORDER_ID }) }
    );

    expect(response.status).toBe(403);
  });

  it('rejects unauthorized guests', async () => {
    const guestCookie = createGuestSessionCookie('guest@example.com');
    cookieValue = guestCookie.value;

    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        created_at: new Date().toISOString(),
        response_id: null,
        email: 'other@example.com',
        user_id: null
      },
      error: null
    });

    const response = await POST(new Request(`http://localhost/api/reports/${ORDER_ID}/download-url`, { method: 'POST' }), {
      params: Promise.resolve({ orderId: ORDER_ID })
    });

    expect(response.status).toBe(401);
  });

  it('returns a 503 when report generation is unavailable', async () => {
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        created_at: new Date().toISOString(),
        response_id: null,
        email: 'guest@example.com',
        user_id: USER_ID
      },
      error: null
    });

    const generationError = new ReportGenerationError('Report failed');
    generationError.code = 'RESULT_INVALID';
    getOrCreateReportDownloadUrlMock.mockRejectedValue(generationError);

    const response = await POST(
      new Request(`http://localhost/api/reports/${ORDER_ID}/download-url`, {
        method: 'POST',
        headers: { 'x-user-id': USER_ID }
      }),
      { params: Promise.resolve({ orderId: ORDER_ID }) }
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: REPORT_UNAVAILABLE_ERROR });
  });
});
