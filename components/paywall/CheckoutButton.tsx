'use client';

import { useState } from 'react';
import { trackEvent } from '../../lib/analytics';

type CheckoutConfig = {
  environment: 'sandbox' | 'production';
  clientToken: string;
  priceId: string;
  currency: 'EUR';
  amount: number;
  description: string;
};

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

  const handleCheckout = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout');
      if (!response.ok) {
        throw new Error('Checkout unavailable.');
      }

      const config = (await response.json()) as CheckoutConfig;

      await loadPaddleScript();

      if (!window.Paddle) {
        throw new Error('Paddle SDK not available.');
      }

      window.Paddle.Environment.set(config.environment);
      window.Paddle.Initialize({ token: config.clientToken });

      trackEvent('checkout_open', { resultId, priceId: config.priceId });

      window.Paddle.Checkout.open({
        items: [
          {
            priceId: config.priceId,
            quantity: 1
          }
        ]
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
