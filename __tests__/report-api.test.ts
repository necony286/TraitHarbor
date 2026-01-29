import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ORDER_AMOUNT_CENTS = 5000;

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => undefined })
}));

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn()
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

import { PdfRenderConcurrencyError } from '../lib/report-download';
import { PDF_RENDER_CONCURRENCY_RETRY_SECONDS, POST } from '../src/app/api/report/route';

const setupSuccessfulOrderMock = () => {
  getOrderByIdMock.mockResolvedValue({
    data: {
      id: ORDER_ID,
      status: 'paid',
      amount_cents: ORDER_AMOUNT_CENTS,
      response_id: null,
      paddle_order_id: null,
      created_at: '2024-01-01T00:00:00.000Z',
      user_id: USER_ID
    },
    error: null
  });
};

describe('/api/report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
    setupSuccessfulOrderMock();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires authorization', async () => {
    const response = await POST(
      new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: ORDER_ID })
      })
    );

    expect(response.status).toBe(401);
  });

  it('returns a signed URL for authorized requests', async () => {
    getOrCreateReportDownloadUrlMock.mockResolvedValue({ url: 'https://example.com/report.pdf', cached: true });

    const response = await POST(
      new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
        body: JSON.stringify({ orderId: ORDER_ID })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ url: 'https://example.com/report.pdf' });
  });

  it('returns 429 with retry-after when report generation is busy', async () => {
    getOrCreateReportDownloadUrlMock.mockRejectedValue(new PdfRenderConcurrencyError('Busy'));

    const response = await POST(
      new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
        body: JSON.stringify({ orderId: ORDER_ID })
      })
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe(String(PDF_RENDER_CONCURRENCY_RETRY_SECONDS));
  });
});
