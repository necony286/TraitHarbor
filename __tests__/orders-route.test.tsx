import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { PATCH } from '../src/app/api/orders/route';
import CheckoutCallbackClient from '../src/app/checkout/callback/CheckoutCallbackClient';

const orderId = '0d2a9f23-1f52-4f7d-9b75-b9b21c0ef35d';
const resultId = 'f7f0a8c1-7a7a-4fda-8ec1-2f4c6d1c9427';
const supabaseMock = { from: vi.fn() };

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn()
}));

vi.mock('../lib/supabase', () => ({
  getSupabaseAdminClient: () => supabaseMock
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'orderId' ? orderId : null)
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
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const supabaseUpdateChainMock = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: maybeSingleMock
    };

    supabaseMock.from.mockReturnValue(supabaseUpdateChainMock);

    const request = new Request('http://localhost/api/orders', {
      method: 'PATCH',
      body: JSON.stringify({ orderId, status: 'pending_webhook' })
    });

    const response = await PATCH(request);
    const payload = await response.json();

    expect(supabaseMock.from).toHaveBeenCalledWith('orders');
    expect(supabaseUpdateChainMock.update).toHaveBeenCalledWith({ status: 'pending_webhook' });
    expect(supabaseUpdateChainMock.eq).toHaveBeenCalledWith('id', orderId);
    expect(supabaseUpdateChainMock.eq).toHaveBeenCalledWith('status', 'created');
    expect(response.status).toBe(409);
    expect(payload).toEqual({ error: 'Order status conflict.' });
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
      amountCents: 5000,
      resultId,
      paddleOrderId: null,
      createdAt: '2024-01-01T00:00:00.000Z'
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
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/orders?orderId=${orderId}`);
  });
});
