import { beforeEach, describe, expect, it, vi } from 'vitest';

const getFacetScoresByResultIdMock = vi.fn();
const getReportAssetMock = vi.fn();
const getScoresByResultIdMock = vi.fn();
const storeReportAssetMock = vi.fn();
const updateOrderReportFileKeyMock = vi.fn();

vi.mock('../lib/db', () => ({
  getFacetScoresByResultId: (...args: unknown[]) => getFacetScoresByResultIdMock(...args),
  getReportAsset: (...args: unknown[]) => getReportAssetMock(...args),
  getScoresByResultId: (...args: unknown[]) => getScoresByResultIdMock(...args),
  storeReportAsset: (...args: unknown[]) => storeReportAssetMock(...args),
  updateOrderReportFileKey: (...args: unknown[]) => updateOrderReportFileKeyMock(...args)
}));

const generateReportPdfMock = vi.fn();

vi.mock('../lib/pdf', () => ({
  BrowserlessConfigError: class BrowserlessConfigError extends Error {},
  PdfRenderConcurrencyError: class PdfRenderConcurrencyError extends Error {},
  generateReportPdf: (...args: unknown[]) => generateReportPdfMock(...args),
  traitSectionOrder: [
    { name: 'Openness', scoreKey: 'O' },
    { name: 'Conscientiousness', scoreKey: 'C' },
    { name: 'Extraversion', scoreKey: 'E' },
    { name: 'Agreeableness', scoreKey: 'A' },
    { name: 'Neuroticism', scoreKey: 'N' }
  ]
}));

const getLegacyReportPathMock = vi.fn();
const getReportPathMock = vi.fn();
const getReportSignedUrlMock = vi.fn();
const getReportSignedUrlForPathMock = vi.fn();
const uploadReportMock = vi.fn();

vi.mock('../lib/storage', () => ({
  getLegacyReportPath: (...args: unknown[]) => getLegacyReportPathMock(...args),
  getReportPath: (...args: unknown[]) => getReportPathMock(...args),
  getReportSignedUrl: (...args: unknown[]) => getReportSignedUrlMock(...args),
  getReportSignedUrlForPath: (...args: unknown[]) => getReportSignedUrlForPathMock(...args),
  uploadReport: (...args: unknown[]) => uploadReportMock(...args)
}));

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
    getReportPathMock.mockReturnValue(reportPath);
    getLegacyReportPathMock.mockReturnValue(legacyPath);
    getReportAssetMock.mockResolvedValue({ data: null, error: null });
  });

  it('deduplicates paths and returns a cached URL', async () => {
    getReportSignedUrlForPathMock.mockResolvedValueOnce('https://example.com/report.pdf');

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
    expect(getReportSignedUrlForPathMock).toHaveBeenCalledTimes(1);
    expect(getReportSignedUrlForPathMock).toHaveBeenCalledWith(reportPath, 300);
    expect(updateOrderReportFileKeyMock).not.toHaveBeenCalled();
  });

  it('tries legacy paths and updates the report file key when needed', async () => {
    getReportSignedUrlForPathMock.mockImplementation(async (path: string) =>
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
    expect(getReportSignedUrlForPathMock.mock.calls.map(([path]) => path)).toEqual([
      reportPath,
      'reports/old.pdf',
      legacyPath
    ]);
    expect(updateOrderReportFileKeyMock).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      reportFileKey: legacyPath
    });
  });

  it('generates and uploads a report when no cached URL exists', async () => {
    getReportSignedUrlForPathMock.mockResolvedValue(null);
    getScoresByResultIdMock.mockResolvedValue({
      data: { O: 10, C: 20, E: 30, A: 40, N: 50 },
      error: null
    });
    getFacetScoresByResultIdMock.mockResolvedValue({ data: null, error: null });
    generateReportPdfMock.mockResolvedValue(Buffer.from('pdf'));
    getReportSignedUrlMock.mockResolvedValue('https://example.com/new.pdf');

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
    expect(generateReportPdfMock).toHaveBeenCalled();
    expect(uploadReportMock).toHaveBeenCalledWith(ORDER_ID, expect.any(Buffer));
    expect(updateOrderReportFileKeyMock).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      reportFileKey: reportPath
    });
    expect(storeReportAssetMock).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      userId: '11111111-1111-1111-1111-111111111111',
      reportPath,
      kind: 'report_pdf'
    });
  });
});
