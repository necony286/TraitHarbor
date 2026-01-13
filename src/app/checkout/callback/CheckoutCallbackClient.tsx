'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '../../../../lib/analytics';
import { orderRecordSchema, type OrderRecord } from '../../../../lib/orders';
import { getReportAccessTokenKey } from '../../../../lib/report-access-token';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Container } from '../../../../components/ui/Container';

const ORDER_STATUS_POLL_INTERVAL_MS = 3000;

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
    console.error('Failed to parse order from API after update:', parsed.error);
    throw new Error('Unable to update order status.');
  }
  return parsed.data;
};

export default function CheckoutCallbackClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const trackedPurchaseRef = useRef(false);

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
        setErrorMessage((error instanceof Error && error.message) || 'Unable to fetch order status.');
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
        const currentOrder = await fetchOrder(orderId);
        if (currentOrder.status !== 'created') {
          setOrder(currentOrder);
          return;
        }
        const updated = await markPendingWebhook(orderId);
        setOrder(updated);
      } catch (error) {
        setErrorMessage((error instanceof Error && error.message) || 'Unable to update order status.');
      } finally {
        setIsLoading(false);
      }
    };

    updateOrderStatus();
  }, [orderId]);

  useEffect(() => {
    if (!orderId || order?.status !== 'pending_webhook') {
      return;
    }

    void refreshStatus({ silent: true });

    const intervalId = window.setInterval(() => {
      void refreshStatus({ silent: true });
    }, ORDER_STATUS_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [orderId, order?.status, refreshStatus]);

  useEffect(() => {
    if (!orderId || !order || order.status !== 'paid') {
      return;
    }

    if (trackedPurchaseRef.current) {
      return;
    }

    trackEvent('purchase_success', { orderId, resultId: order.resultId });
    trackedPurchaseRef.current = true;
  }, [order, orderId]);

  const handleReportDownload = async () => {
    if (!orderId || isGeneratingReport) return;

    setIsGeneratingReport(true);
    setReportError(null);

    try {
      const reportAccessToken = sessionStorage.getItem(getReportAccessTokenKey(orderId));
      if (!reportAccessToken) {
        throw new Error('Missing report access token.');
      }

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reportAccessToken })
      });

      if (!response.ok) {
        throw new Error('Unable to generate report.');
      }

      const payload = await response.json();
      if (!payload?.url) {
        throw new Error('Report URL missing.');
      }

      setReportUrl(payload.url);
    } catch (error) {
      setReportError((error instanceof Error && error.message) || 'Unable to generate report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Container className="checkout">
      <header className="checkout__header">
        <p className="eyebrow">Checkout complete</p>
        <h1>Processing your payment</h1>
        <p className="muted">We&apos;re confirming your order and preparing your premium report.</p>
      </header>

      <Card className="checkout__card">
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

        {order?.status === 'paid' ? (
          <div className="checkout__report">
            <p className="muted">Your payment is confirmed. Download your premium report below.</p>
            {reportUrl ? (
              <a className="checkout__download" href={reportUrl} target="_blank" rel="noopener noreferrer">
                Download report PDF
              </a>
            ) : (
              <Button type="button" onClick={handleReportDownload} disabled={isGeneratingReport}>
                {isGeneratingReport ? 'Preparing report…' : 'Generate report PDF'}
              </Button>
            )}
            {reportError ? <p className="checkout__error">{reportError}</p> : null}
          </div>
        ) : null}

        <div className="checkout__actions">
          <Button type="button" variant="ghost" onClick={() => refreshStatus()} disabled={!orderId || isLoading}>
            Retry status check
          </Button>
          <Link className="ui-button ui-button--secondary" href="/quiz">
            Retake quiz
          </Link>
        </div>

        <p className="muted checkout__note">
          If this takes more than a few minutes, refresh this page or contact support for a resend link.
        </p>
      </Card>
    </Container>
  );
}
