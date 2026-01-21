'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '../../lib/analytics';
import { getOrCreateAnonymousUserId } from '../../lib/anonymous-user';
import { z } from 'zod';
import { checkoutConfigSchema } from '../../lib/payments';
import { orderRecordSchema } from '../../lib/orders';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

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
let paddleScriptPromise: Promise<void> | null = null;

function loadPaddleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paddle can only load in the browser.'));
  }

  if (window.Paddle) {
    return Promise.resolve();
  }

  if (paddleScriptPromise) {
    return paddleScriptPromise;
  }

  const isScriptLoaded = (script: HTMLScriptElement) => script.dataset.paddleLoaded === 'true';

  paddleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-paddle]');
    const handleError = () => {
      document.querySelector('script[data-paddle]')?.remove();
      paddleScriptPromise = null;
      reject(new Error('Failed to load Paddle.'));
    };

    if (existingScript) {
      if (isScriptLoaded(existingScript)) {
        existingScript.dataset.paddleLoaded = 'true';
        resolve();
        return;
      }

      existingScript.addEventListener(
        'load',
        () => {
          existingScript.dataset.paddleLoaded = 'true';
          resolve();
        },
        { once: true }
      );
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = PADDLE_SCRIPT_SRC;
    script.async = true;
    script.dataset.paddle = 'true';
    script.onload = () => {
      script.dataset.paddleLoaded = 'true';
      resolve();
    };
    script.onerror = handleError;
    document.body.appendChild(script);
  });

  return paddleScriptPromise;
}

export function CheckoutButton({ resultId }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isInteractionDisabled = !hydrated || isLoading;

  const handleCheckout = async () => {
    setErrorMessage(null);
    setEmailError(null);

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

      setIsLoading(true);

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
      const sessionId = providerSessionId ?? order.id;

      const redirectToCallback = (sid: string) => {
        const callbackUrl = `/checkout/callback?session_id=${sid}`;
        window.location.assign(callbackUrl);
      };

      const isPlaywrightMode = process.env.NEXT_PUBLIC_PLAYWRIGHT === '1';
      const isFixtureMode = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';

      if (isPlaywrightMode || isFixtureMode) {
        // Keep E2E tests on the local callback flow without loading Paddle.
        redirectToCallback(sessionId);
        return;
      }

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
        redirectToCallback(sessionId);
        return;
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

      type PaddleCheckoutOptions = Parameters<typeof window.Paddle.Checkout.open>[0];
      const items: PaddleCheckoutOptions['items'] = [
        {
          priceId: checkout.priceId,
          quantity: 1
        }
      ];
      const customData: PaddleCheckoutOptions['customData'] = {
        order_id: order.id
      };
      const checkoutOptions: PaddleCheckoutOptions = {
        items,
        customer: {
          email: parsedEmail.data
        },
        customData,
        successCallback: () => {
          redirectToCallback(sessionId);
        }
      };

      try {
        window.Paddle.Checkout.open(checkoutOptions);
      } catch (error) {
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
      <FormField id={`checkout-email-${resultId}`} label="Email for receipt and access" error={emailError}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isInteractionDisabled}
        />
      </FormField>
      <Button type="button" onClick={handleCheckout} disabled={isInteractionDisabled} size="lg">
        {isLoading ? 'Loading checkout…' : 'Unlock full report (PDF)'}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
