import { describe, expect, it } from 'vitest';
import { getCheckoutConfigResult } from '../lib/payments';

describe('getCheckoutConfigResult', () => {
  it('returns missing environment variables when required values are absent', () => {
    const result = getCheckoutConfigResult({
      envSnapshot: {
        clientToken: undefined,
        configuredEnvironmentValue: undefined,
        productionPriceId: undefined,
        sandboxPriceId: undefined
      }
    });

    expect(result).toEqual({
      checkout: null,
      reason: 'MISSING_ENV',
      missing: ['PADDLE_CLIENT_TOKEN', 'PADDLE_SANDBOX_PRICE_ID', 'PADDLE_PRICE_ID']
    });
  });

  it('throws a detailed invariant error when missing values are allowed', () => {
    expect(() =>
      getCheckoutConfigResult({
        allowMissingEnv: true,
        envSnapshot: {
          clientToken: undefined,
          configuredEnvironmentValue: undefined,
          productionPriceId: undefined,
          sandboxPriceId: undefined
        }
      })
    ).toThrowError(
      'Internal error: Invariant violation in getCheckoutConfigResult. Missing: clientToken, effectivePriceId'
    );
  });
});
