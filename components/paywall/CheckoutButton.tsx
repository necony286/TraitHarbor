'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '../../lib/analytics';
import { getOrCreateAnonymousUserId } from '../../lib/anonymous-user';
import { z } from 'zod';
import { checkoutConfigSchema } from '../../lib/payments';
import { orderRecordSchema } from '../../lib/orders';
import { Button } from '../ui/Button';

const createOrderResponseSchema = z.object({
  order: orderRecordSchema,
  checkout: checkoutConfigSchema.nullable(),
  providerSessionId: z.string().uuid().nullable(),
  reason: z.string().optional(),
  missing: z.array(z.string()).optional()
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
    // eslint-disable-next-line no-console
    console.log('[Paddle] SDK already loaded.');
    return Promise.resolve();
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-paddle]');
  if (existingScript) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-console
      console.log('[Paddle] Waiting for existing SDK script to load.');
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paddle.')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PADDLE_SCRIPT_SRC;
    script.async = true;
    script.dataset.paddle = 'true';
    // eslint-disable-next-line no-console
    console.log('[Paddle] Injecting SDK script.');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paddle.'));
    document.body.appendChild(script);
  });
}

export function CheckoutButton({ resultId }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setErrorMessage(null);
    setEmailError(null);
    setIsLoading(true);

    try {
      const userId = getOrCreateAnonymousUserId();
      if (!userId) {
        throw new Error('Unable to start checkout.');
      }

      const parsedEmail = z.string().trim().email().safeParse(email);
      if (!parsedEmail.success) {
        setEmailError('Please enter a valid email address to continue.');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, userId, email: parsedEmail.data })
      });
      if (!response.ok) {
        throw new Error('Checkout unavailable.');
      }

      const parsedResponse = createOrderResponseSchema.safeParse(await response.json());
      if (!parsedResponse.success) {
        console.error('Invalid checkout response from API:', parsedResponse.error);
        throw new Error('Invalid checkout response.');
      }

      const { order, checkout, providerSessionId, reason, missing } = parsedResponse.data;

      if (!checkout) {
        if (reason === 'MISSING_ENV') {
          // eslint-disable-next-line no-console
          console.error('Checkout not configured. Missing env vars:', missing);
        }
        setErrorMessage('Checkout not configured.');
        return;
      }

      await loadPaddleScript();

      if (!window.Paddle) {
        throw new Error('Paddle SDK not available.');
      }

      try {
        window.Paddle.Environment.set(checkout.environment);
        window.Paddle.Initialize({ token: checkout.clientToken });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Paddle] Failed to initialize SDK', error);
        throw error;
      }

      trackEvent('checkout_open', { resultId, priceId: checkout.priceId, orderId: order.id });

      const checkoutOptions = {
        items: [
          {
            priceId: checkout.priceId,
            quantity: 1
          }
        ],
        customer: {
          email: parsedEmail.data
        },
        customData: {
          order_id: order.id
        },
        successCallback: () => {
          const sessionId = providerSessionId ?? order.id;
          router.push(`/checkout/callback?session_id=${sessionId}`);
        }
      } as unknown as Parameters<typeof window.Paddle.Checkout.open>[0];

      try {
        window.Paddle.Checkout.open(checkoutOptions);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Paddle] Checkout.open failed', error);
        throw error;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Checkout error', error);
      setErrorMessage('Checkout is unavailable right now. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label htmlFor={`checkout-email-${resultId}`} className="text-sm font-medium text-slate-700">
          Email for receipt and access
        </label>
        <input
          id={`checkout-email-${resultId}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
      </div>
      <Button type="button" onClick={handleCheckout} disabled={isLoading} size="lg">
        {isLoading ? 'Loading checkout…' : 'Unlock full report (PDF)'}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
