'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { orderRecordSchema, type OrderRecord } from '../../../../lib/orders';

const fetchOrder = async (orderId: string) => {
  const response = await fetch(`/api/orders?orderId=${orderId}`);
  if (!response.ok) {
    throw new Error('Unable to load order status.');
  }
  const payload = await response.json();
  const parsed = orderRecordSchema.safeParse(payload?.order);
  if (!parsed.success) {
    console.error('Failed to parse order from API:', parsed.error);
    throw new Error('Unable to load order status.');
  }
  return parsed.data;
};

const markPendingWebhook = async (orderId: string) => {
  const response = await fetch('/api/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status: 'pending_webhook' })
  });

  if (!response.ok) {
    throw new Error('Unable to update order status.');
  }

  const payload = await response.json();
  const parsed = orderRecordSchema.safeParse(payload?.order);
  if (!parsed.success) {
    throw new Error('Unable to update order status.');
  }
  return parsed.data;
};

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshStatus = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!orderId) return;
    if (!silent) {
      setIsLoading(true);
      setErrorMessage(null);
    }

    try {
      const updated = await fetchOrder(orderId);
      setOrder(updated);
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to fetch order status.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  },
    [orderId]
  );

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      setErrorMessage('Missing order confirmation details.');
      return;
    }

    const updateOrderStatus = async () => {
      try {
        const updated = await markPendingWebhook(orderId);
        setOrder(updated);
      } catch (error) {
        setErrorMessage((error as Error).message || 'Unable to update order status.');
      } finally {
        setIsLoading(false);
      }
    };

    updateOrderStatus();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    if (order?.status && order.status !== 'pending_webhook') {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshStatus({ silent: true });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [orderId, order?.status, refreshStatus]);

  return (
    <div className="checkout">
      <header className="checkout__header">
        <p className="eyebrow">Checkout complete</p>
        <h1>Processing your payment</h1>
        <p className="muted">We&apos;re confirming your order and preparing your premium report.</p>
      </header>

      <div className="checkout__card">
        {errorMessage ? <p className="checkout__error">{errorMessage}</p> : null}

        {isLoading ? <p className="muted">Checking payment status…</p> : null}

        {!isLoading && order ? (
          <div className="checkout__status">
            <p>
              Order <span className="checkout__order">{order.id}</span>
            </p>
            <p className="muted">Status: {order.status.replace('_', ' ')}</p>
          </div>
        ) : null}

        <div className="checkout__actions">
          <button className="button button--ghost" type="button" onClick={refreshStatus} disabled={!orderId || isLoading}>
            Retry status check
          </button>
          <Link className="button" href="/quiz">
            Retake quiz
          </Link>
        </div>

        <p className="muted checkout__note">
          If this takes more than a few minutes, refresh this page or contact support for a resend link.
        </p>
      </div>
    </div>
  );
}
