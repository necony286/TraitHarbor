import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logError, logWarn } from './logger';

type RateLimitMode = 'fail-open' | 'fail-closed';

type RateLimitConfig = {
  request: Request;
  route: string;
  limit: number;
  window: `${number} ${'s' | 'm' | 'h'}`;
  mode: RateLimitMode;
  identifier?: string;
};

type RateLimitResult = {
  success: boolean;
  reset: number;
  remaining: number;
};

type Limiter = {
  limit: (key: string) => Promise<RateLimitResult>;
};

const parseWindowMs = (window: RateLimitConfig['window']) => {
  const [amountRaw, unit] = window.split(' ') as [string, string];
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount)) {
    return 60_000;
  }
  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60_000;
    case 'h':
      return amount * 3_600_000;
    default:
      return 60_000;
  }
};

const devFallbackStore = new Map<string, { count: number; reset: number }>();

const createDevLimiter = (limit: number, window: RateLimitConfig['window']): Limiter => {
  const windowMs = parseWindowMs(window);

  return {
    limit: async (key: string) => {
      const now = Date.now();
      const entry = devFallbackStore.get(key);

      if (!entry || entry.reset <= now) {
        const reset = now + windowMs;
        devFallbackStore.set(key, { count: 1, reset });
        return { success: true, remaining: limit - 1, reset };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0, reset: entry.reset };
      }

      const nextCount = entry.count + 1;
      devFallbackStore.set(key, { count: nextCount, reset: entry.reset });
      return { success: true, remaining: Math.max(0, limit - nextCount), reset: entry.reset };
    }
  };
};

const upstashLimiters = new Map<string, Limiter>();

const getUpstashLimiter = (limit: number, window: RateLimitConfig['window']): Limiter => {
  const key = `${limit}:${window}`;
  const existing = upstashLimiters.get(key);
  if (existing) return existing;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? ''
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, window),
    analytics: true,
    prefix: 'bigfive:rate-limit'
  });

  const limiter: Limiter = {
    limit: async (identifier: string) => {
      const result = await ratelimit.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset
      };
    }
  };

  upstashLimiters.set(key, limiter);
  return limiter;
};

const getLimiter = (limit: number, window: RateLimitConfig['window']): Limiter | null => {
  const hasUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (hasUpstash) {
    return getUpstashLimiter(limit, window);
  }

  if (process.env.NODE_ENV === 'development') {
    return createDevLimiter(limit, window);
  }

  return null;
};

export const getClientIdentifier = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const [first] = forwardedFor.split(',');
    if (first?.trim()) return first.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return 'unknown';
};

export const buildRateLimitKey = (route: string, identifier: string) => `${route}:${identifier}`;

export const enforceRateLimit = async ({
  request,
  route,
  limit,
  window,
  mode,
  identifier
}: RateLimitConfig): Promise<Response | null> => {
  const limiter = getLimiter(limit, window);
  if (!limiter) {
    if (mode === 'fail-open') {
      logWarn('Rate limiter unavailable; allowing request.', { route });
      return null;
    }

    logError('Rate limiter unavailable; blocking request.', { route });
    return NextResponse.json({ error: 'Rate limiter unavailable.' }, { status: 503 });
  }

  const clientIdentifier = identifier ?? getClientIdentifier(request);
  const key = buildRateLimitKey(route, clientIdentifier);
  const result = await limiter.limit(key);

  if (!result.success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  return null;
};
