import { beforeEach, describe, expect, it, mocked, vi } from 'vitest';

import {
  getFacetScoresByResultId,
  getReportAsset,
  getScoresByResultId,
  storeReportAsset,
  updateOrderReportFileKey
} from '../lib/db';
import { generateReportPdf } from '../lib/pdf';
import {
  getLegacyReportPath,
  getReportPath,
  getReportSignedUrl,
  getReportSignedUrlForPath,
  uploadReport
} from '../lib/storage';

vi.mock('../lib/db');
vi.mock('../lib/pdf', () => ({
  BrowserlessConfigError: class BrowserlessConfigError extends Error {},
  PdfRenderConcurrencyError: class PdfRenderConcurrencyError extends Error {},
  generateReportPdf: vi.fn(),
  traitSectionOrder: [
    { name: 'Openness', scoreKey: 'O' },
    { name: 'Conscientiousness', scoreKey: 'C' },
    { name: 'Extraversion', scoreKey: 'E' },
    { name: 'Agreeableness', scoreKey: 'A' },
    { name: 'Neuroticism', scoreKey: 'N' }
  ]
}));
vi.mock('../lib/storage');
vi.mock('../lib/logger', () => ({
  logWarn: vi.fn()
}));

import { getOrCreateReportDownloadUrl } from '../lib/report-download';

const ORDER_ID = '22222222-2222-2222-2222-222222222222';
const RESPONSE_ID = '33333333-3333-3333-3333-333333333333';

describe('getOrCreateReportDownloadUrl', () => {
  const reportPath = 'reports/order-report.pdf';
  const legacyPath = 'legacy/order-report.pdf';

  beforeEach(() => {
    vi.clearAllMocks();
    mocked(getReportPath).mockReturnValue(reportPath);
    mocked(getLegacyReportPath).mockReturnValue(legacyPath);
    mocked(getReportAsset).mockResolvedValue({ data: null, error: null });
  });

  it('deduplicates paths and returns a cached URL', async () => {
    mocked(getReportSignedUrlForPath).mockResolvedValueOnce('https://example.com/report.pdf');

    const result = await getOrCreateReportDownloadUrl({
      order: {
        id: ORDER_ID,
        response_id: RESPONSE_ID,
        created_at: new Date().toISOString(),
        report_file_key: reportPath
      },
      ttlSeconds: 300
    });

    expect(result).toEqual({
      url: 'https://example.com/report.pdf',
      cached: true,
      reportFileKey: reportPath
    });
    expect(getReportSignedUrlForPath).toHaveBeenCalledTimes(1);
    expect(getReportSignedUrlForPath).toHaveBeenCalledWith(reportPath, 300);
    expect(updateOrderReportFileKey).not.toHaveBeenCalled();
  });

  it('tries legacy paths and updates the report file key when needed', async () => {
    mocked(getReportSignedUrlForPath).mockImplementation(async (path: string) =>
      path === legacyPath ? 'https://example.com/legacy.pdf' : null
    );

    const result = await getOrCreateReportDownloadUrl({
      order: {
        id: ORDER_ID,
        response_id: RESPONSE_ID,
        created_at: new Date().toISOString(),
        report_file_key: 'reports/old.pdf'
      },
      ttlSeconds: 120
    });

    expect(result).toEqual({
      url: 'https://example.com/legacy.pdf',
      cached: true,
      reportFileKey: legacyPath
    });
    expect(mocked(getReportSignedUrlForPath).mock.calls.map(([path]) => path)).toEqual([
      reportPath,
      'reports/old.pdf',
      legacyPath
    ]);
    expect(updateOrderReportFileKey).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      reportFileKey: legacyPath
    });
  });

  it('generates and uploads a report when no cached URL exists', async () => {
    mocked(getReportSignedUrlForPath).mockResolvedValue(null);
    mocked(getScoresByResultId).mockResolvedValue({
      data: { O: 10, C: 20, E: 30, A: 40, N: 50 },
      error: null
    });
    mocked(getFacetScoresByResultId).mockResolvedValue({ data: null, error: null });
    mocked(generateReportPdf).mockResolvedValue(Buffer.from('pdf'));
    mocked(getReportSignedUrl).mockResolvedValue('https://example.com/new.pdf');

    const result = await getOrCreateReportDownloadUrl({
      order: {
        id: ORDER_ID,
        response_id: RESPONSE_ID,
        created_at: new Date().toISOString(),
        report_file_key: null,
        user_id: '11111111-1111-1111-1111-111111111111'
      },
      ttlSeconds: 600
    });

    expect(result).toEqual({
      url: 'https://example.com/new.pdf',
      cached: false,
      reportFileKey: reportPath
    });
    expect(generateReportPdf).toHaveBeenCalled();
    expect(uploadReport).toHaveBeenCalledWith(ORDER_ID, expect.any(Buffer));
    expect(updateOrderReportFileKey).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      reportFileKey: reportPath
    });
    expect(storeReportAsset).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      userId: '11111111-1111-1111-1111-111111111111',
      reportPath,
      kind: 'report_pdf'
    });
  });
});
