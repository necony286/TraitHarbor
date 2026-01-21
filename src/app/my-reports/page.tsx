'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '../../../components/ui/Container';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/States/EmptyState';
import { ErrorBanner } from '../../../components/ui/States/ErrorBanner';
import { LoadingState } from '../../../components/ui/States/LoadingState';

type ReportOrder = {
  id: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  reportReady: boolean;
};

export default function MyReportsPage() {
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch('/api/my-reports', { method: 'GET' });
        if (response.status === 401) {
          setError('Please verify your email to view your paid reports.');
          return;
        }

        if (!response.ok) {
          setError('We could not load your reports. Please try again.');
          return;
        }

        const payload = (await response.json()) as { orders?: ReportOrder[] };
        setOrders(payload.orders ?? []);
      } catch (errorResponse) {
        setError(errorResponse instanceof Error ? errorResponse.message : 'Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleDownload = async (orderId: string) => {
    setActiveDownloadId(orderId);
    setDownloadError(null);

    try {
      const response = await fetch(`/api/reports/${orderId}/download-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Unable to generate download link.');
      }

      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Download link missing.');
      }

      window.location.assign(payload.url);
    } catch (downloadErrorResponse) {
      setDownloadError(downloadErrorResponse instanceof Error ? downloadErrorResponse.message : 'Unable to download report.');
    } finally {
      setActiveDownloadId(null);
    }
  };

  return (
    <div className="bg-background py-16">
      <Container>
        <Card className="mx-auto max-w-3xl p-8 md:p-12">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">My reports</p>
            <h1 className="text-3xl font-semibold text-slate-900">Your paid TraitHarbor reports</h1>
            <p className="text-base text-slate-600">
              Access your purchased reports here. Use the download button once your report is ready.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {isLoading ? (
              <LoadingState message="Loading your reports…" />
            ) : null}

            {error ? (
              <ErrorBanner
                message={error}
                tone="warning"
                action={
                  <Link href="/retrieve-report" className="font-semibold text-amber-900 underline underline-offset-2">
                    Request a link
                  </Link>
                }
              />
            ) : null}

            {downloadError ? (
              <ErrorBanner message={downloadError} />
            ) : null}

            {!isLoading && !error && orders.length === 0 ? (
              <EmptyState message="We couldn&apos;t find any paid reports for this email yet." />
            ) : null}

            {!isLoading && !error && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-500">
                        Purchased {new Date(order.paidAt ?? order.createdAt).toLocaleDateString()} · Status:{' '}
                        {order.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        Report availability: {order.reportReady ? 'Ready to download' : 'Preparing'}
                      </p>
                    </div>
                    <Button type="button" disabled={!order.reportReady || activeDownloadId === order.id} onClick={() => handleDownload(order.id)}>
                      {activeDownloadId === order.id ? 'Preparing…' : 'Download report'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      </Container>
    </div>
  );
}
