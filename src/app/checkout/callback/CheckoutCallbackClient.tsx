'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '../../../../lib/analytics';
import { getAnonymousUserId, setAnonymousUserId } from '../../../../lib/anonymous-user';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Container } from '../../../../components/ui/Container';

const MAX_POLL_TIME_MS = 60_000;
const INITIAL_POLL_DELAY_MS = 1000;
const MAX_POLL_DELAY_MS = 8000;

type OrderBySession = {
  id: string;
  status: string;
  resultId: string | null;
  createdAt: string;
  paidAt: string | null;
  email: string | null;
  userId?: string | null;
  reportReady: boolean;
  providerSessionId: string | null;
};

const fetchOrderBySession = async (sessionId: string) => {
  const response = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
  if (!response.ok) {
    throw new Error('Unable to load order status.');
  }
  const payload = await response.json();
  return payload?.order as OrderBySession;
};

export default function CheckoutCallbackClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderBySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [linkStatus, setLinkStatus] = useState<string | null>(null);
  const trackedPurchaseRef = useRef(false);
  const pollStartRef = useRef<number | null>(null);
  const pollDelayRef = useRef(INITIAL_POLL_DELAY_MS);
  const pollTimeoutRef = useRef<number | null>(null);

  const refreshStatus = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!sessionId) return;
      if (!silent) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const updated = await fetchOrderBySession(sessionId);
        if (updated?.userId) {
          setAnonymousUserId(updated.userId);
        }
        setOrder(updated);
        return updated;
      } catch (error) {
        setErrorMessage((error instanceof Error && error.message) || 'Unable to fetch order status.');
        return null;
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      setErrorMessage('Missing order confirmation details.');
      return;
    }

    pollStartRef.current = Date.now();
    pollDelayRef.current = INITIAL_POLL_DELAY_MS;

    const poll = async () => {
      if (!pollStartRef.current) return;
      if (Date.now() - pollStartRef.current > MAX_POLL_TIME_MS) {
        setIsLoading(false);
        setErrorMessage('We are still confirming your payment. Please refresh in a moment.');
        return;
      }

      const updated = await refreshStatus({ silent: true });

      const shouldContinue =
        !updated ||
        updated.status === 'created' ||
        updated.status === 'pending' ||
        updated.status === 'pending_webhook';

      if (shouldContinue) {
        pollDelayRef.current = Math.min(pollDelayRef.current * 2, MAX_POLL_DELAY_MS);
        pollTimeoutRef.current = window.setTimeout(poll, pollDelayRef.current);
      } else {
        setIsLoading(false);
      }
    };

    void poll();

    return () => {
      if (pollTimeoutRef.current) {
        window.clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [refreshStatus, sessionId]);

  useEffect(() => {
    if (!sessionId || !order || order.status !== 'paid') {
      return;
    }

    if (trackedPurchaseRef.current) {
      return;
    }

    trackEvent('purchase_success', { orderId: order.id, resultId: order.resultId });
    trackedPurchaseRef.current = true;
  }, [order, sessionId]);

  const handleReportDownload = async () => {
    if (!order || isGeneratingReport) return;

    setIsGeneratingReport(true);
    setReportError(null);

    try {
      const anonymousUserId = getAnonymousUserId();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (anonymousUserId) {
        headers['x-user-id'] = anonymousUserId;
      }

      const response = await fetch(`/api/reports/${order.id}/download-url`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error('Unable to generate report.');
      }

      const payload = await response.json();
      if (!payload?.url) {
        throw new Error('Report URL missing.');
      }

      window.location.assign(payload.url);
    } catch (error) {
      setReportError((error instanceof Error && error.message) || 'Unable to generate report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRequestLink = async () => {
    if (!order?.email) {
      setLinkStatus('Please use the email you checked out with to request access.');
      return;
    }

    setLinkStatus(null);

    try {
      const response = await fetch('/api/report-access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: order.email })
      });

      if (!response.ok) {
        throw new Error('Unable to request access link.');
      }

      setLinkStatus('We just emailed a secure access link. Check your inbox shortly.');
    } catch (error) {
      setLinkStatus((error instanceof Error && error.message) || 'Unable to request access link.');
    }
  };

  return (
    <Container className="py-12">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout complete</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Processing your payment</h1>
        <p className="text-base text-slate-600">We&apos;re confirming your order and preparing your premium report.</p>
      </header>

      <Card className="mt-8 gap-6 border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-indigo-100/40">
        {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}

        {isLoading ? <p className="text-sm text-slate-500">Checking payment status…</p> : null}

        {!isLoading && order ? (
          <div className="space-y-1 text-sm">
            <p>
              Order <span className="font-semibold text-slate-900">{order.id}</span>
            </p>
            <p className="text-slate-500">Status: {order.status.replace('_', ' ')}</p>
          </div>
        ) : null}

        {order?.status === 'paid' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Your payment is confirmed. Download your premium report below.</p>
            <Button type="button" onClick={handleReportDownload} disabled={isGeneratingReport}>
              {isGeneratingReport ? 'Preparing report…' : 'Download report PDF'}
            </Button>
            {reportError ? <p className="text-sm font-medium text-red-600">{reportError}</p> : null}
            <div className="space-y-2">
              <Button type="button" variant="ghost" onClick={handleRequestLink}>
                Email me my access link
              </Button>
              {linkStatus ? <p className="text-sm text-slate-600">{linkStatus}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="ghost" onClick={() => refreshStatus()} disabled={!sessionId || isLoading}>
            Retry status check
          </Button>
          <Link href="/quiz" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:text-indigo-700">
            Retake quiz
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          If this takes more than a few minutes, refresh this page or contact support for a resend link.
        </p>
      </Card>
    </Container>
  );
}
