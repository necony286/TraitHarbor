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

const SANDBOX_PRICE: CheckoutPrice = {
  priceId: process.env.PADDLE_SANDBOX_PRICE_ID ?? '',
  currency: 'EUR',
  amount: 900,
  description: 'Starter PDF'
};

const PRODUCTION_PRICE: CheckoutPrice = {
  priceId: process.env.PADDLE_PRICE_ID ?? '',
  currency: 'EUR',
  amount: 900,
  description: 'Starter PDF'
};

const PRICE_ALLOWLIST = [SANDBOX_PRICE, PRODUCTION_PRICE];

export function getCheckoutAmountCents(): number {
  return PRODUCTION_PRICE.amount;
}

function assertEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function assertAllowedPrice(price: CheckoutPrice): CheckoutPrice {
  if (!price.priceId) {
    throw new Error('Missing PADDLE_PRICE_ID');
  }

  const match = PRICE_ALLOWLIST.find(
    (allowed) => allowed.priceId === price.priceId && allowed.currency === price.currency && allowed.amount === price.amount
  );

  if (!match) {
    throw new Error('Price not in allowlist');
  }

  return match;
}

export function getCheckoutConfig(): CheckoutConfig {
  const clientToken = assertEnvValue(process.env.PADDLE_CLIENT_TOKEN, 'PADDLE_CLIENT_TOKEN');
  const configuredEnvironmentValue = process.env.PADDLE_ENV;
  if (configuredEnvironmentValue && !checkoutConfigSchema.shape.environment.options.includes(configuredEnvironmentValue)) {
    throw new Error(`Invalid PADDLE_ENV: "${configuredEnvironmentValue}". Must be 'sandbox' or 'production'.`);
  }
  const configuredEnvironment = configuredEnvironmentValue as PaddleEnvironment | undefined;
  const environmentFromToken = clientToken.startsWith('test_')
    ? 'sandbox'
    : clientToken.startsWith('live_')
      ? 'production'
      : null;

  if (configuredEnvironment === 'sandbox' && !clientToken.startsWith('test_')) {
    throw new Error('PADDLE_ENV is sandbox but PADDLE_CLIENT_TOKEN is not a test_ token.');
  }

  if (configuredEnvironment === 'production' && !clientToken.startsWith('live_')) {
    throw new Error('PADDLE_ENV is production but PADDLE_CLIENT_TOKEN is not a live_ token.');
  }

  const environment = (configuredEnvironment ?? environmentFromToken ?? 'sandbox') as PaddleEnvironment;

  const price = assertAllowedPrice(environment === 'sandbox' ? SANDBOX_PRICE : PRODUCTION_PRICE);

  return {
    environment,
    clientToken,
    ...price
  };
}
