import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import QuizPage from '../src/app/quiz/page';
import { saveQuizState } from '../lib/storage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('../lib/analytics', () => ({
  trackQuizEvent: vi.fn(),
  trackEvent: vi.fn()
}));

vi.mock('../lib/storage', () => ({
  saveQuizState: vi.fn(),
  loadQuizState: vi.fn(() => null),
  clearQuizState: vi.fn()
}));

vi.mock('../lib/ipip', () => ({
  loadQuizItems: () => [
    { id: 'Q1', prompt: 'Question one.', trait: 'O', reverseKeyed: false, facetKey: 'O1_Imagination' },
    { id: 'Q2', prompt: 'Question two.', trait: 'C', reverseKeyed: false, facetKey: 'C1_SelfEfficacy' }
  ]
}));

describe('QuizPage autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('debounces rapid autosave writes', () => {
    const saveQuizStateMock = vi.mocked(saveQuizState);
    render(<QuizPage />);

    act(() => {
      vi.runOnlyPendingTimers();
    });
    saveQuizStateMock.mockClear();

    const agreeOptions = screen.getAllByRole('radio', { name: /^Agree$/i });
    fireEvent.click(agreeOptions[0]);
    fireEvent.click(agreeOptions[1]);

    expect(saveQuizStateMock).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(saveQuizStateMock).toHaveBeenCalledTimes(1);
    expect(saveQuizStateMock).toHaveBeenCalledWith('ipip120', expect.any(Object));
  });
});
