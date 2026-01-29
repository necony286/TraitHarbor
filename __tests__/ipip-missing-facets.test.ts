import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ipip facet mapping guardrails', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
