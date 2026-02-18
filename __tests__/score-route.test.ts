import { describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/score/route';

const createResponseAndScoresMock = vi.fn();
const loadQuizItemsMock = vi.fn();

const mockItems120 = [
  {
    id: 'Q1',
    prompt: 'Sample prompt',
    trait: 'O',
    reverseKeyed: false,
    facetKey: 'O1_Imagination'
  }
];
const mockItems60 = [
  {
    id: 'Q61',
    prompt: 'Quick prompt',
    trait: 'O',
    reverseKeyed: true,
    facetKey: 'O1_Imagination'
  }
];

vi.mock('../lib/ipip', async () => {
  const actual = await vi.importActual<typeof import('../lib/ipip')>('../lib/ipip');
  return {
    ...actual,
    loadQuizItems: (...args: unknown[]) => loadQuizItemsMock(...args)
  };
});

vi.mock('../lib/db', () => ({
  createResponseAndScores: (...args: unknown[]) => createResponseAndScoresMock(...args)
}));

describe('score API route', () => {
  beforeEach(() => {
    createResponseAndScoresMock.mockReset();
    loadQuizItemsMock.mockReset();
    loadQuizItemsMock.mockImplementation(({ variant }: { variant: string }) =>
      variant === 'ipip60' ? mockItems60 : mockItems120
    );
  });

  it('defaults to ipip120 when quizVariant is missing', async () => {
    createResponseAndScoresMock.mockResolvedValue({ data: '11111111-1111-1111-1111-111111111111', error: null });

    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({ answers: { Q1: 3 }, userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f' })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ resultId: '11111111-1111-1111-1111-111111111111', quizVariant: 'ipip120' });
    expect(createResponseAndScoresMock).toHaveBeenCalledWith({
      userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f',
      traits: { O: 50, C: 0, E: 0, A: 0, N: 0 },
      answers: { Q1: 3 },
      facetScores: { Openness: { O1_Imagination: 50 } },
      expectedCount: mockItems120.length,
      quizVariant: 'ipip120'
    });
  });

  it('returns an error and no result id when answer inserts fail', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    createResponseAndScoresMock.mockResolvedValue({
      data: null,
      error: {
        message: 'Failed to insert answers: check constraint failed',
        code: 'XXA02'
      }
    });

    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({ answers: { Q1: 3 }, userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f' })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Failed to store answers.' });
    consoleErrorSpy.mockRestore();
  });

  it('rejects mixed answer IDs even when counts match', async () => {
    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({
        answers: { Q61: 5 },
        userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f',
        quizVariant: 'ipip120'
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('Answer IDs must exactly match quiz items for this quiz variant.');
    expect(payload.missing).toEqual(['Q1']);
    expect(payload.extra).toEqual(['Q61']);
    expect(createResponseAndScoresMock).not.toHaveBeenCalled();
  });

  it('supports ipip60 variant scoring', async () => {
    createResponseAndScoresMock.mockResolvedValue({ data: '22222222-2222-2222-2222-222222222222', error: null });

    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({
        answers: { Q61: 2 },
        userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f',
        quizVariant: 'ipip60'
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.quizVariant).toBe('ipip60');
  });
});
