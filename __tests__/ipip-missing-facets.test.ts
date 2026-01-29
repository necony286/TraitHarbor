import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ipip facet mapping guardrails', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('throws when facet mappings are missing in test', async () => {
    vi.doMock('../src/data/ipip120.facets.json', () => ({ default: {} }));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { loadQuizItems } = await import('../lib/ipip');

    expect(() => loadQuizItems()).toThrow(/Missing facet mappings/);
    expect(warnSpy).toHaveBeenCalled();
  });
});
