import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

const validResultId = '11111111-1111-1111-1111-111111111111';

describe('ResultsPage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders a fallback when Supabase configuration is missing', async () => {
    const { default: ResultsPage } = await import('../src/app/results/[resultId]/page');
    const ui = await ResultsPage({ params: Promise.resolve({ resultId: validResultId }) });

    render(ui);

    expect(screen.getByText(/results unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn'?t load your results/i)).toBeInTheDocument();
  });
});
