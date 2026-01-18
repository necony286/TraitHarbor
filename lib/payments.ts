import { z } from 'zod';

export type PaddleEnvironment = 'sandbox' | 'production';

export type CheckoutPrice = {
  priceId: string;
  currency: 'EUR';
  amount: number;
  description: string;
};

export type CheckoutConfig = CheckoutPrice & {
  environment: PaddleEnvironment;
  clientToken: string;
};

export const checkoutConfigSchema = z.object({
  priceId: z.string(),
  currency: z.literal('EUR'),
  amount: z.number(),
  description: z.string(),
  environment: z.enum(['sandbox', 'production']),
  clientToken: z.string()
});

const CHECKOUT_PRICE_AMOUNT = 900;
const CHECKOUT_PRICE_CURRENCY: CheckoutPrice['currency'] = 'EUR';
const CHECKOUT_PRICE_DESCRIPTION = 'Starter PDF';

export function getCheckoutAmountCents(): number {
  return CHECKOUT_PRICE_AMOUNT;
}

export type CheckoutConfigResult = {
  checkout: CheckoutConfig | null;
  reason?: 'MISSING_ENV';
  missing?: string[];
};

function getCheckoutEnvSnapshot() {
  return {
    clientToken: process.env.PADDLE_CLIENT_TOKEN,
    configuredEnvironmentValue: process.env.PADDLE_ENV,
    productionPriceId: process.env.PADDLE_PRICE_ID,
    sandboxPriceId: process.env.PADDLE_SANDBOX_PRICE_ID
  };
}

function buildPrice(priceId: string): CheckoutPrice {
  return {
    priceId,
    currency: CHECKOUT_PRICE_CURRENCY,
    amount: CHECKOUT_PRICE_AMOUNT,
    description: CHECKOUT_PRICE_DESCRIPTION
  };
}

export function getCheckoutConfigResult(): CheckoutConfigResult {
  const { clientToken, configuredEnvironmentValue, productionPriceId, sandboxPriceId } = getCheckoutEnvSnapshot();
  const allowedEnvironments = checkoutConfigSchema.shape.environment.options;
  if (configuredEnvironmentValue && !allowedEnvironments.includes(configuredEnvironmentValue as PaddleEnvironment)) {
    throw new Error(`Invalid PADDLE_ENV: "${configuredEnvironmentValue}". Must be 'sandbox' or 'production'.`);
  }
  const configuredEnvironment = configuredEnvironmentValue as PaddleEnvironment | undefined;
  const missing: string[] = [];

  if (!clientToken) {
    missing.push('PADDLE_CLIENT_TOKEN');
  }

  const environmentFromToken = clientToken
    ? clientToken.startsWith('test_')
      ? 'sandbox'
      : clientToken.startsWith('live_')
        ? 'production'
        : null
    : null;

  if (configuredEnvironment === 'sandbox' && clientToken && !clientToken.startsWith('test_')) {
    throw new Error('PADDLE_ENV is sandbox but PADDLE_CLIENT_TOKEN is not a test_ token.');
  }

  if (configuredEnvironment === 'production' && clientToken && !clientToken.startsWith('live_')) {
    throw new Error('PADDLE_ENV is production but PADDLE_CLIENT_TOKEN is not a live_ token.');
  }

  const environment = (configuredEnvironment ?? environmentFromToken ?? 'sandbox') as PaddleEnvironment;

  const effectivePriceId =
    environment === 'sandbox' ? sandboxPriceId || productionPriceId : productionPriceId;

  if (!effectivePriceId) {
    if (environment === 'sandbox') {
      if (!sandboxPriceId) {
        missing.push('PADDLE_SANDBOX_PRICE_ID');
      }
      if (!productionPriceId) {
        missing.push('PADDLE_PRICE_ID');
      }
    } else {
      missing.push('PADDLE_PRICE_ID');
    }
  }

  if (missing.length > 0) {
    return { checkout: null, reason: 'MISSING_ENV', missing };
  }
  if (!clientToken || !effectivePriceId) {
    throw new Error('Internal error: Invariant violation in getCheckoutConfigResult');
  }
  return {
    checkout: {
      environment,
      clientToken,
      ...buildPrice(effectivePriceId)
    }
  };
}
