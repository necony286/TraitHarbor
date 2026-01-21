import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TraitChart } from '../components/results/TraitChart';
import resultsFixture from '../src/data/results.fixture.json';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: (...args: unknown[]) => pushMock(...args)
  })
}));

const validResultId = '11111111-1111-1111-1111-111111111111';

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders a fallback when Supabase configuration is missing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { default: ResultsPage } = await import('../src/app/results/[resultId]/page');
    const ui = await ResultsPage({ params: Promise.resolve({ resultId: validResultId }) });

    render(ui);

    expect(screen.getByText(/results unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn'?t load your results/i)).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('renders the results page with fixture data', async () => {
    vi.stubEnv('NEXT_PUBLIC_QUIZ_FIXTURE_MODE', '1');
    const { default: ResultsPage } = await import('../src/app/results/[resultId]/page');
    const ui = await ResultsPage({ params: Promise.resolve({ resultId: validResultId }) });

    render(ui);

    expect(screen.getByText('TraitHarbor personality snapshot')).toBeInTheDocument();
    expect(screen.queryByText(/your key traits/i)).toBeNull();

    const traitHeadings = [
      `${resultsFixture.O}% Openness`,
      `${resultsFixture.C}% Conscientiousness`,
      `${resultsFixture.E}% Extraversion`,
      `${resultsFixture.A}% Agreeableness`,
      `${resultsFixture.N}% Neuroticism`
    ];

    traitHeadings.forEach((heading) => {
      expect(screen.getAllByText(heading)).toHaveLength(1);
    });
  });

  it('shows a progress fill with width greater than zero for a score of 50', () => {
    const { container } = render(
      <TraitChart scores={{ O: 50, C: 0, E: 0, A: 0, N: 0 }} />
    );

    const fills = Array.from(container.querySelectorAll('div[style*="width"]'));
    const hasNonZeroWidth = fills.some((fill) => {
      const style = (fill as HTMLElement).style;
      return !!style.width && style.width !== '0%';
    });

    expect(hasNonZeroWidth).toBe(true);
  });
});
