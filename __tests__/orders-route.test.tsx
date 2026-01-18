import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getCheckoutConfigResult } from '../lib/payments';
import { PATCH, POST } from '../src/app/api/orders/route';
import CheckoutCallbackClient from '../src/app/checkout/callback/CheckoutCallbackClient';

const orderId = '0d2a9f23-1f52-4f7d-9b75-b9b21c0ef35d';
const resultId = 'f7f0a8c1-7a7a-4fda-8ec1-2f4c6d1c9427';
const userId = '5f394c07-2e3a-4b42-8e57-f9c527fa4cc8';
const email = 'buyer@example.com';
const createProvisionalOrderMock = vi.fn();
const updateOrderStatusMock = vi.fn();

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn()
}));

vi.mock('../lib/db', () => ({
  createProvisionalOrder: (...args: unknown[]) => createProvisionalOrderMock(...args),
  updateOrderStatus: (...args: unknown[]) => updateOrderStatusMock(...args),
  getOrderById: vi.fn()
}));

vi.mock('../lib/payments', () => ({
  getCheckoutAmountCents: () => 5000,
  getCheckoutConfigResult: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'session_id' ? orderId : null)
  })
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe('orders API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 409 when attempting to update a non-created order', async () => {
    updateOrderStatusMock.mockResolvedValue({ data: null, error: null });

    const request = new Request('http://localhost/api/orders', {
      method: 'PATCH',
      body: JSON.stringify({ orderId, status: 'pending_webhook' })
    });

    const response = await PATCH(request);
    const payload = await response.json();

    expect(updateOrderStatusMock).toHaveBeenCalledWith({ orderId, status: 'pending_webhook' });
    expect(response.status).toBe(409);
    expect(payload).toEqual({ error: 'Order status conflict.' });
  });

  it('returns 404 when creating an order with a missing result', async () => {
    createProvisionalOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'Response not found.', code: 'NOT_FOUND' }
    });

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ resultId, userId, email })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(createProvisionalOrderMock).toHaveBeenCalledWith({
      userId,
      responseId: resultId,
      amountCents: 5000,
      reportAccessTokenHash: expect.any(String),
      email,
      provider: 'paddle',
      providerSessionId: expect.any(String)
    });
    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: 'Result not found.' });
  });

  it('returns 404 when the result disappears before order creation', async () => {
    createProvisionalOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'Response not found.', code: 'NOT_FOUND' }
    });

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ resultId, userId, email })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(createProvisionalOrderMock).toHaveBeenCalledWith({
      userId,
      responseId: resultId,
      amountCents: 5000,
      reportAccessTokenHash: expect.any(String),
      email,
      provider: 'paddle',
      providerSessionId: expect.any(String)
    });
    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: 'Result not found.' });
  });

  it('returns checkout null when checkout config loading fails', async () => {
    const createdOrder = {
      id: orderId,
      status: 'created',
      amount_cents: 5000,
      response_id: resultId,
      paddle_order_id: null,
      created_at: '2024-01-01T00:00:00.000Z'
    };
    createProvisionalOrderMock.mockResolvedValue({ data: createdOrder, error: null });

    const checkoutConfigError = new Error('Checkout config unavailable');
    const getCheckoutConfigMock = vi.mocked(getCheckoutConfigResult);
    getCheckoutConfigMock.mockImplementation(() => {
      throw checkoutConfigError;
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ resultId, userId, email })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(createProvisionalOrderMock).toHaveBeenCalledWith({
      userId,
      responseId: resultId,
      amountCents: 5000,
      reportAccessTokenHash: expect.any(String),
      email,
      provider: 'paddle',
      providerSessionId: expect.any(String)
    });
    expect(getCheckoutConfigMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load checkout config for order creation.',
      checkoutConfigError
    );
    expect(response.status).toBe(200);
    expect(payload).toEqual({
      order: {
        id: orderId,
        status: 'created',
        amountCents: 5000,
        resultId,
        paddleOrderId: null,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      checkout: null,
      providerSessionId: expect.any(String)
    });

    consoleErrorSpy.mockRestore();
  });
});

describe('Checkout callback behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not downgrade an already-paid order', async () => {
    const paidOrder = {
      id: orderId,
      status: 'paid',
      resultId,
      createdAt: '2024-01-01T00:00:00.000Z',
      paidAt: '2024-01-02T00:00:00.000Z',
      email,
      reportReady: true,
      providerSessionId: orderId
    };

    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ order: paidOrder }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    render(<CheckoutCallbackClient />);

    expect(await screen.findByText(/Status: paid/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/orders/by-session?session_id=${orderId}`);
  });
});
