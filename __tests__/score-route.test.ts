import { describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/score/route';

const rpcMock = vi.fn();
const supabaseMock = { rpc: rpcMock };
const mockItems = [
  {
    id: 'Q1',
    prompt: 'Sample prompt',
    trait: 'O',
    reverseKeyed: false
  }
];
const mockAnswers = { Q1: 3 };

vi.mock('../lib/ipip', () => ({
  loadQuizItems: () => mockItems
}));

vi.mock('../lib/supabase', () => ({
  getSupabaseAdminClient: () => supabaseMock
}));

describe('score API route', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('returns an error and no result id when answer inserts fail', async () => {
    rpcMock.mockImplementation(async () => {
      return {
        data: null,
        error: { message: 'Failed to insert answers: check constraint failed' }
      };
    });

    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({ answers: mockAnswers })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(rpcMock).toHaveBeenCalledWith('create_result_with_answers', {
      traits: expect.any(Object),
      answers: mockAnswers,
      expected_count: mockItems.length
    });
    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Failed to store answers.' });
  });
});
