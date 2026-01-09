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
  getReportSignedUrl: vi.fn(),
  uploadReport: vi.fn()
}));

vi.mock('../lib/supabase', () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  id: ORDER_ID,
                  status: 'paid',
                  result_id: RESULT_ID,
                  created_at: new Date().toISOString(),
                  report_access_token: REPORT_ACCESS_TOKEN
                },
                error: null
              })
            })
          })
        };
      }

      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: null
            })
          })
        })
      };
    }
  })
}));

import { getReportSignedUrl } from '../lib/storage';
import { POST } from '../src/app/api/report/route';

describe('/api/report', () => {
  it('fails when the report access token is invalid', async () => {
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
});
