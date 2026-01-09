import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { PG_FOREIGN_KEY_VIOLATION_ERROR_CODE } from '../lib/constants';
import { getCheckoutConfig } from '../lib/payments';
import { PATCH, POST } from '../src/app/api/orders/route';
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

vi.mock('../lib/payments', () => ({
  getCheckoutAmountCents: () => 5000,
  getCheckoutConfig: vi.fn()
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
    expect(supabaseUpdateChainMock.select).toHaveBeenCalledWith('id, status, amount_cents, result_id, paddle_order_id, created_at');
    expect(supabaseUpdateChainMock.maybeSingle).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(payload).toEqual({ error: 'Order status conflict.' });
  });

  it('returns 404 when creating an order with a missing result', async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const resultsSelectChainMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: maybeSingleMock
    };
    const insertMock = vi.fn().mockReturnThis();
    const ordersInsertChainMock = {
      insert: insertMock,
      select: vi.fn().mockReturnThis(),
      single: vi.fn()
    };

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'results') {
        return resultsSelectChainMock;
      }
      if (table === 'orders') {
        return ordersInsertChainMock;
      }
      return undefined;
    });

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ resultId })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(supabaseMock.from).toHaveBeenCalledWith('results');
    expect(resultsSelectChainMock.select).toHaveBeenCalledWith('id');
    expect(resultsSelectChainMock.eq).toHaveBeenCalledWith('id', resultId);
    expect(maybeSingleMock).toHaveBeenCalledTimes(1);
    expect(insertMock).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: 'Result not found.' });
  });

  it('returns 404 when the result disappears before order creation', async () => {
    const resultsMaybeSingleMock = vi.fn().mockResolvedValue({ data: { id: resultId }, error: null });
    const resultsSelectChainMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: resultsMaybeSingleMock
    };
    const insertError = { code: PG_FOREIGN_KEY_VIOLATION_ERROR_CODE };
    const ordersInsertChainMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: insertError })
    };

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'results') {
        return resultsSelectChainMock;
      }
      if (table === 'orders') {
        return ordersInsertChainMock;
      }
      return undefined;
    });

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ resultId })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(supabaseMock.from).toHaveBeenCalledWith('results');
    expect(resultsSelectChainMock.select).toHaveBeenCalledWith('id');
    expect(resultsSelectChainMock.eq).toHaveBeenCalledWith('id', resultId);
    expect(resultsMaybeSingleMock).toHaveBeenCalledTimes(1);
    expect(supabaseMock.from).toHaveBeenCalledWith('orders');
    expect(ordersInsertChainMock.insert).toHaveBeenCalledWith({
      amount_cents: expect.any(Number),
      status: 'created',
      result_id: resultId,
      report_access_token: expect.any(String)
    });
    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: 'Result not found.' });
  });

  it('returns checkout null when checkout config loading fails', async () => {
    const resultsMaybeSingleMock = vi.fn().mockResolvedValue({ data: { id: resultId }, error: null });
    const resultsSelectChainMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: resultsMaybeSingleMock
    };
    const createdOrder = {
      id: orderId,
      status: 'created',
      amount_cents: 5000,
      result_id: resultId,
      paddle_order_id: null,
      created_at: '2024-01-01T00:00:00.000Z'
    };
    const ordersInsertChainMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: createdOrder, error: null })
    };

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'results') {
        return resultsSelectChainMock;
      }
      if (table === 'orders') {
        return ordersInsertChainMock;
      }
      return undefined;
    });

    const checkoutConfigError = new Error('Checkout config unavailable');
    const getCheckoutConfigMock = vi.mocked(getCheckoutConfig);
    getCheckoutConfigMock.mockImplementation(() => {
      throw checkoutConfigError;
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ resultId })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(supabaseMock.from).toHaveBeenNthCalledWith(1, 'results');
    expect(resultsSelectChainMock.select).toHaveBeenCalledWith('id');
    expect(resultsSelectChainMock.eq).toHaveBeenCalledWith('id', resultId);
    expect(resultsMaybeSingleMock).toHaveBeenCalledTimes(1);
    expect(supabaseMock.from).toHaveBeenNthCalledWith(2, 'orders');
    expect(ordersInsertChainMock.insert).toHaveBeenCalledWith({
      amount_cents: 5000,
      status: 'created',
      result_id: resultId,
      report_access_token: expect.any(String)
    });
    expect(ordersInsertChainMock.select).toHaveBeenCalledWith(
      'id, status, amount_cents, result_id, paddle_order_id, created_at'
    );
    expect(ordersInsertChainMock.single).toHaveBeenCalledTimes(1);
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
      reportAccessToken: expect.any(String)
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
