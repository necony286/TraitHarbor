import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Likert } from '../components/quiz/Likert';
import { loadQuizItems } from '../lib/ipip';
import { loadQuizState, saveQuizState } from '../lib/storage';

describe('ipip loader', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE;
  });

  it('loads the full IPIP-120 set by default', () => {
    const items = loadQuizItems();
    expect(items).toHaveLength(120);
  });

  it('honors fixture mode for quick runs', () => {
    process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE = '1';
    const items = loadQuizItems();
    expect(items).toHaveLength(10);
  });
});

describe('quiz storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists and restores quiz state with matching item count', () => {
    saveQuizState({ answers: { Q1: 3 }, currentPage: 2, itemCount: 5 });
    const restored = loadQuizState(5);
    expect(restored?.answers.Q1).toBe(3);
    expect(restored?.currentPage).toBe(2);
  });

  it('ignores state when item count changes', () => {
    saveQuizState({ answers: { Q1: 3 }, currentPage: 1, itemCount: 5 });
    const restored = loadQuizState(10);
    expect(restored).toBeNull();
  });
});

describe('Likert component', () => {
  it('renders options and reports selections', () => {
    const onChange = vi.fn();
    render(<Likert name="test" value={3} onChange={onChange} ariaLabelledby="test-label" />);

    const agreeOption = screen.getByLabelText(/^Agree$/i);
    fireEvent.click(agreeOption);

    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-labelledby', 'test-label');
  });
});
