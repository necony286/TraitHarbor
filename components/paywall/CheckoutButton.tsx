'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '../../lib/analytics';
import { getOrCreateAnonymousUserId } from '../../lib/anonymous-user';
import { z } from 'zod';
import { checkoutConfigSchema } from '../../lib/payments';
import { orderRecordSchema } from '../../lib/orders';
import { getReportAccessTokenKey } from '../../lib/report-access-token';

const createOrderResponseSchema = z.object({
  order: orderRecordSchema,
  checkout: checkoutConfigSchema,
  reportAccessToken: z.string().uuid()
});

type CheckoutButtonProps = {
  resultId: string;
};

const PADDLE_SCRIPT_SRC = 'https://cdn.paddle.com/paddle/v2/paddle.js';

function loadPaddleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paddle can only load in the browser.'));
  }

  if (window.Paddle) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-paddle]');
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paddle.')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PADDLE_SCRIPT_SRC;
    script.async = true;
    script.dataset.paddle = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paddle.'));
    document.body.appendChild(script);
  });
}

export function CheckoutButton({ resultId }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const userId = getOrCreateAnonymousUserId();
      if (!userId) {
        throw new Error('Unable to start checkout.');
      }
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, userId })
      });
      if (!response.ok) {
        throw new Error('Checkout unavailable.');
      }

      const parsedResponse = createOrderResponseSchema.safeParse(await response.json());
      if (!parsedResponse.success) {
        console.error('Invalid checkout response from API:', parsedResponse.error);
        throw new Error('Invalid checkout response.');
      }

      const { order, checkout, reportAccessToken } = parsedResponse.data;

      sessionStorage.setItem(getReportAccessTokenKey(order.id), reportAccessToken);

      await loadPaddleScript();

      if (!window.Paddle) {
        throw new Error('Paddle SDK not available.');
      }

      window.Paddle.Environment.set(checkout.environment);
      window.Paddle.Initialize({ token: checkout.clientToken });

      trackEvent('checkout_open', { resultId, priceId: checkout.priceId, orderId: order.id });

      window.Paddle.Checkout.open({
        items: [
          {
            priceId: checkout.priceId,
            quantity: 1
          }
        ],
        customData: {
          order_id: order.id
        },
        successCallback: () => {
          router.push(`/checkout/callback?orderId=${order.id}`);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Checkout error', error);
      setErrorMessage('Checkout is unavailable right now. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button className="button" type="button" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Loading checkout…' : 'Unlock full report (PDF)'}
      </button>
      {errorMessage ? <p className="muted">{errorMessage}</p> : null}
    </div>
  );
}
