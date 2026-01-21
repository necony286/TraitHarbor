import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, afterEach, vi } from 'vitest';
import { HomePageClient } from '../src/components/figma/home/HomePageClient';
import QuizPage from '../src/app/quiz/page';
import ResultsPage from '../src/app/results/[resultId]/page';
import CheckoutCallbackClient from '../src/app/checkout/callback/CheckoutCallbackClient';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'session_id' ? 'session-123' : null)
  }),
  redirect: vi.fn()
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
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
    { id: 'Q1', prompt: 'Question one.' },
    { id: 'Q2', prompt: 'Question two.' }
  ]
}));

vi.mock('../lib/anonymous-user', () => ({
  getOrCreateAnonymousUserId: vi.fn(),
  getAnonymousUserId: vi.fn(() => null),
  setAnonymousUserId: vi.fn()
}));

vi.mock('../lib/db', () => ({
  getScoresByResultId: vi.fn(async () => ({ data: null, error: { message: 'Unavailable.' } }))
}));

describe('core screens a11y', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('home page has no a11y violations', async () => {
    const { container } = render(<HomePageClient />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('quiz page has no a11y violations', async () => {
    vi.useFakeTimers();
    const { container } = render(<QuizPage />);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    const results = await axe(container);

    expect(results).toHaveNoViolations();
    vi.useRealTimers();
  });

  it('results page fallback has no a11y violations', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    const ui = await ResultsPage({
      params: Promise.resolve({ resultId: '11111111-1111-1111-1111-111111111111' })
    });
    const { container } = render(ui);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    vi.unstubAllEnvs();
  });

  it('checkout callback has no a11y violations', async () => {
    const paidOrder = {
      id: 'order-123',
      status: 'paid',
      resultId: 'result-123',
      createdAt: '2024-01-01T00:00:00.000Z',
      paidAt: '2024-01-02T00:00:00.000Z',
      email: 'buyer@example.com',
      reportReady: true,
      providerSessionId: 'session-123'
    };

    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ order: paidOrder }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const { container } = render(<CheckoutCallbackClient />);

    expect(await screen.findByText(/Status: paid/i)).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
