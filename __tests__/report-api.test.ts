import { describe, expect, it, vi } from 'vitest';

const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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

import { POST } from '../src/app/api/report/route';

describe('/api/report', () => {
  it('requires authorization', async () => {
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        amount_cents: 5000,
        response_id: null,
        paddle_order_id: null,
        created_at: new Date().toISOString(),
        user_id: USER_ID
      },
      error: null
    });

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
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        amount_cents: 5000,
        response_id: null,
        paddle_order_id: null,
        created_at: new Date().toISOString(),
        user_id: USER_ID
      },
      error: null
    });

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
});
