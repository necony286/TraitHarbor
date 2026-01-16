import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const logErrorMock = vi.fn();
const logWarnMock = vi.fn();

vi.mock('../lib/logger', () => ({
  logError: (...args: unknown[]) => logErrorMock(...args),
  logWarn: (...args: unknown[]) => logWarnMock(...args)
}));

const loadRateLimit = async () => {
  vi.resetModules();
  return import('../lib/rate-limit');
};

describe('rate limiting safeguards', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.RATE_LIMIT_ALLOW_FAIL_OPEN;
    delete process.env.VERCEL_ENV;
  });

  afterEach(() => {
    process.env = env;
  });

  it('fails closed in production when Upstash is missing', async () => {
    process.env.NODE_ENV = 'production';
    const { enforceRateLimit } = await loadRateLimit();

    const response = await enforceRateLimit({
      request: new Request('http://localhost/api/score'),
      route: 'score',
      limit: 1,
      window: '1 m',
      mode: 'fail-closed'
    });

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toMatchObject({ error: 'Rate limiter unavailable.' });
  });

  it('blocks fail-open requests in production without explicit opt-in', async () => {
    process.env.NODE_ENV = 'production';
    const { enforceRateLimit } = await loadRateLimit();

    const response = await enforceRateLimit({
      request: new Request('http://localhost/api/orders'),
      route: 'orders',
      limit: 1,
      window: '1 m',
      mode: 'fail-open'
    });

    expect(response?.status).toBe(503);
    expect(logErrorMock).toHaveBeenCalledWith('RATE_LIMIT_DISABLED: Upstash rate limiting is unavailable.', {
      route: 'orders',
      mode: 'fail-open'
    });
  });

  it('uses a dev fallback limiter when Upstash is missing in development', async () => {
    process.env.NODE_ENV = 'development';
    const { enforceRateLimit } = await loadRateLimit();

    const request = new Request('http://localhost/api/score', {
      headers: { 'x-real-ip': '127.0.0.1' }
    });

    const rateLimitParams = {
      request,
      route: 'score',
      limit: 2,
      window: '1 m',
      mode: 'fail-open'
    };

    const first = await enforceRateLimit(rateLimitParams);
    const second = await enforceRateLimit(rateLimitParams);
    const third = await enforceRateLimit(rateLimitParams);

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(third?.status).toBe(429);
  });

  it('logs missing Upstash rate limiting once per route', async () => {
    process.env.NODE_ENV = 'production';
    const { enforceRateLimit } = await loadRateLimit();

    const request = new Request('http://localhost/api/score');

    const rateLimitParams = {
      request,
      route: 'score',
      limit: 1,
      window: '1 m',
      mode: 'fail-closed'
    };

    await enforceRateLimit(rateLimitParams);
    await enforceRateLimit(rateLimitParams);

    expect(logErrorMock).toHaveBeenCalledTimes(1);
    expect(logErrorMock).toHaveBeenCalledWith('RATE_LIMIT_DISABLED: Upstash rate limiting is unavailable.', {
      route: 'score',
      mode: 'fail-closed'
    });
    expect(logWarnMock).not.toHaveBeenCalled();
  });
});
