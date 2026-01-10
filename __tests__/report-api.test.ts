import { describe, expect, it, vi } from 'vitest';

const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const RESULT_ID = '11111111-1111-1111-1111-111111111111';
const REPORT_ACCESS_TOKEN = '33333333-3333-3333-3333-333333333333';

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn()
}));

vi.mock('../lib/pdf', () => ({
  generateReportPdf: vi.fn()
}));

vi.mock('../lib/storage', () => ({
  getReportPath: (orderId: string) => `orders/${orderId}.pdf`,
  getReportSignedUrl: vi.fn(),
  uploadReport: vi.fn()
}));

const getOrderByIdMock = vi.fn();
const getScoresByResultIdMock = vi.fn();
const storeReportAssetMock = vi.fn();
const getReportAssetMock = vi.fn();

vi.mock('../lib/db', () => ({
  getOrderById: (...args: unknown[]) => getOrderByIdMock(...args),
  getScoresByResultId: (...args: unknown[]) => getScoresByResultIdMock(...args),
  storeReportAsset: (...args: unknown[]) => storeReportAssetMock(...args),
  getReportAsset: (...args: unknown[]) => getReportAssetMock(...args)
}));

import { generateReportPdf } from '../lib/pdf';
import { getReportSignedUrl, uploadReport } from '../lib/storage';
import { POST } from '../src/app/api/report/route';

describe('/api/report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeReportAssetMock.mockResolvedValue({ data: null, error: null });
    getReportAssetMock.mockResolvedValue({ data: null, error: null });
    vi.mocked(generateReportPdf).mockResolvedValue(new Uint8Array([1]));
    vi.mocked(uploadReport).mockResolvedValue(undefined);
  });

  it('fails when the report access token is invalid', async () => {
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        amount_cents: 5000,
        response_id: RESULT_ID,
        paddle_order_id: null,
        created_at: new Date().toISOString(),
        report_access_token: REPORT_ACCESS_TOKEN,
        user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      },
      error: null
    });

    const response = await POST(
      new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: ORDER_ID,
          reportAccessToken: '44444444-4444-4444-4444-444444444444'
        })
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'Invalid report access token.' });
    expect(getReportSignedUrl).not.toHaveBeenCalled();
  });

  it('creates an asset row after generating a report', async () => {
    getOrderByIdMock.mockResolvedValue({
      data: {
        id: ORDER_ID,
        status: 'paid',
        amount_cents: 5000,
        response_id: RESULT_ID,
        paddle_order_id: null,
        created_at: new Date().toISOString(),
        report_access_token: REPORT_ACCESS_TOKEN,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      },
      error: null
    });
    getScoresByResultIdMock.mockResolvedValue({
      data: { O: 50, C: 40, E: 60, A: 70, N: 30 },
      error: null
    });

    vi.mocked(getReportSignedUrl).mockResolvedValueOnce(null).mockResolvedValueOnce('https://example.com/report.pdf');

    const response = await POST(
      new Request('http://localhost/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: ORDER_ID,
          reportAccessToken: REPORT_ACCESS_TOKEN,
          name: 'Test'
        })
      })
    );

    expect(response.status).toBe(200);
    expect(storeReportAssetMock).toHaveBeenCalledWith({
      userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      orderId: ORDER_ID,
      kind: 'report_pdf',
      reportPath: `orders/${ORDER_ID}.pdf`
    });
  });
});
