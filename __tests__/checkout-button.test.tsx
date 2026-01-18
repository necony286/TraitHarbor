import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutButton } from '../components/paywall/CheckoutButton';

const pushMock = vi.fn();
const trackEventMock = vi.fn();
const getOrCreateAnonymousUserIdMock = vi.fn();

vi.mock('../lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args)
}));

vi.mock('../lib/anonymous-user', () => ({
  getOrCreateAnonymousUserId: () => getOrCreateAnonymousUserIdMock()
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => pushMock(...args)
  })
}));

describe('CheckoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    getOrCreateAnonymousUserIdMock.mockReturnValue('44c2b1aa-8c6d-4e7a-9c5f-c5c2b3f2f5b4');
    vi.stubGlobal('fetch', vi.fn());
    delete (window as { Paddle?: unknown }).Paddle;
  });

  it('shows a validation error when email is invalid', () => {
    render(<CheckoutButton resultId="0d2a9f23-1f52-4f7d-9b75-b9b21c0ef35d" />);

    fireEvent.click(screen.getByRole('button', { name: 'Unlock full report (PDF)' }));

    expect(
      screen.getByText('Please enter a valid email address to continue.')
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads Paddle, initializes, and opens checkout', async () => {
    const responsePayload = {
      order: {
        id: '8a64a7a9-2e18-45d8-9a0f-1a2d5c2f991d',
        status: 'created',
        amountCents: 900,
        resultId: '0d2a9f23-1f52-4f7d-9b75-b9b21c0ef35d',
        paddleOrderId: null,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      checkout: {
        priceId: 'pri_test_123',
        currency: 'EUR',
        amount: 900,
        description: 'Starter PDF',
        environment: 'sandbox',
        clientToken: 'test_token'
      },
      providerSessionId: '10f3f730-5fbe-4c8a-a8ea-8d2f9b90c8d7'
    };

    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => responsePayload
    });

    const checkoutOpenMock = vi.fn();
    const paddleMock = {
      Environment: { set: vi.fn() },
      Initialize: vi.fn(),
      Checkout: { open: checkoutOpenMock }
    };

    render(<CheckoutButton resultId="0d2a9f23-1f52-4f7d-9b75-b9b21c0ef35d" />);

    fireEvent.change(screen.getByLabelText('Email for receipt and access'), {
      target: { value: 'buyer@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unlock full report (PDF)' }));

    const script = await waitFor(() => {
      const paddleScript = document.querySelector<HTMLScriptElement>('script[data-paddle]');
      expect(paddleScript).not.toBeNull();
      return paddleScript as HTMLScriptElement;
    });

    (window as { Paddle?: typeof paddleMock }).Paddle = paddleMock;
    script?.onload?.(new Event('load'));

    await waitFor(() => {
      expect(paddleMock.Environment.set).toHaveBeenCalledWith('sandbox');
      expect(paddleMock.Initialize).toHaveBeenCalledWith({ token: 'test_token' });
      expect(checkoutOpenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [{ priceId: 'pri_test_123', quantity: 1 }],
          customer: { email: 'buyer@example.com' },
          customData: { order_id: responsePayload.order.id }
        })
      );
    });

    expect(trackEventMock).toHaveBeenCalledWith('checkout_open', {
      resultId: responsePayload.order.resultId,
      priceId: responsePayload.checkout.priceId,
      orderId: responsePayload.order.id
    });
  });
});
