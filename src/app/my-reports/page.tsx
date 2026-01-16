'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '../../../components/ui/Container';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

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
              <p className="text-sm text-slate-500">Loading your reports…</p>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}{' '}
                <Link href="/retrieve-report" className="font-semibold text-amber-900 underline underline-offset-2">
                  Request a link
                </Link>
              </div>
            ) : null}

            {!isLoading && !error && orders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                We couldn&apos;t find any paid reports for this email yet.
              </div>
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
                    <Button type="button" variant="primary" disabled={!order.reportReady}>
                      Download report
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
