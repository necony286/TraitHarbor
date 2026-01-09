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
        error: {
          message: 'Failed to insert answers: check constraint failed',
          code: 'XXA02'
        }
      };
    });

    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({ answers: mockAnswers })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(rpcMock).toHaveBeenCalledWith('create_result_with_answers', {
      traits: { O: 50, C: 0, E: 0, A: 0, N: 0 },
      answers: mockAnswers,
      expected_count: mockItems.length
    });
    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Failed to store answers.' });
  });

  it('returns an error when extra answers are provided', async () => {
    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({ answers: { ...mockAnswers, Q2: 5 } })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Unexpected answers.', extra: ['Q2'] });
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
