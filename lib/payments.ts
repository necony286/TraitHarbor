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

const DEFAULT_PRICE: CheckoutPrice = {
  priceId: process.env.PADDLE_PRICE_ID ?? '',
  currency: 'EUR',
  amount: 900,
  description: 'Starter PDF'
};

const PRICE_ALLOWLIST = [DEFAULT_PRICE];

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
  const environment = (process.env.PADDLE_ENV ?? 'sandbox') as PaddleEnvironment;
  const clientToken = assertEnvValue(process.env.PADDLE_CLIENT_TOKEN, 'PADDLE_CLIENT_TOKEN');
  const price = assertAllowedPrice(DEFAULT_PRICE);

  return {
    environment,
    clientToken,
    ...price
  };
}
