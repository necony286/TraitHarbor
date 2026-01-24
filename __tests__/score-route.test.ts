import { describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/score/route';

const createResponseAndScoresMock = vi.fn();
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

vi.mock('../lib/db', () => ({
  createResponseAndScores: (...args: unknown[]) => createResponseAndScoresMock(...args)
}));

describe('score API route', () => {
  beforeEach(() => {
    createResponseAndScoresMock.mockReset();
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
      body: JSON.stringify({ answers: mockAnswers, userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f' })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(createResponseAndScoresMock).toHaveBeenCalledWith({
      userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f',
      traits: { O: 50, C: 0, E: 0, A: 0, N: 0 },
      answers: mockAnswers,
      facetScores: {},
      expectedCount: mockItems.length
    });
    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Failed to store answers.' });
    consoleErrorSpy.mockRestore();
  });

  it('returns an error when extra answers are provided', async () => {
    const request = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify({ answers: { ...mockAnswers, Q2: 5 }, userId: '9f4e6c02-87f7-4105-8ad0-7d2cf2c9f42f' })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Unexpected answers.', extra: ['Q2'] });
    expect(createResponseAndScoresMock).not.toHaveBeenCalled();
  });
});
