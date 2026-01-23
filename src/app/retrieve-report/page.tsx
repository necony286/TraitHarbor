'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container } from '../../../components/ui/Container';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/States/EmptyState';

type RequestStatus = 'idle' | 'loading' | 'sent';

const REPORT_ERROR_PARAM = 'report_generation_unavailable';
const REPORT_ERROR_MESSAGE =
  'We’re having trouble generating your report right now. Please try again in a few minutes.';
const EMAIL_SENT_MESSAGE = 'Check your email for a secure link to access your paid report.';
const EMAIL_SEND_ERROR_MESSAGE = 'We could not send the email right now. Please try again shortly.';

function RetrieveReportForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const reportErrorMessage = errorParam === REPORT_ERROR_PARAM ? REPORT_ERROR_MESSAGE : null;

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/report-access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        setError(EMAIL_SEND_ERROR_MESSAGE);
        setStatus('idle');
      } else {
        setStatus('sent');
      }
    } catch (errorResponse) {
      setError(errorResponse instanceof Error ? errorResponse.message : 'Something went wrong.');
      setStatus('idle');
    }
  };

  return (
    <div className="bg-background py-16">
      <Container>
        <Card className="mx-auto max-w-2xl p-8 md:p-12">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Retrieve your report</p>
            <h1 className="text-3xl font-semibold text-slate-900">Email me a secure access link</h1>
            <p className="text-base text-slate-600">
              Enter the email you used at checkout and we&apos;ll send a one-time magic link for your paid report.
            </p>
          </div>

          <form onSubmit={submitRequest} className="mt-8 space-y-4">
            {reportErrorMessage ? (
              <EmptyState message={reportErrorMessage} tone="neutral" className="rounded-2xl text-slate-700" />
            ) : null}
            <FormField id="report-email" label="Email address" error={error}>
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </FormField>

            {status === 'sent' ? (
              <EmptyState message={EMAIL_SENT_MESSAGE} tone="success" />
            ) : null}

            <Button type="submit" disabled={status === 'loading'} className="w-full">
              {status === 'loading' ? 'Sending link…' : 'Send access link'}
            </Button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            Need another link later? You can request a new one anytime from this page.
            <div className="mt-2">
              <Link href="/my-reports" className="text-indigo-600 hover:text-indigo-500">
                Go to my reports
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}

export default function RetrieveReportPage() {
  return (
    <Suspense fallback={<div className="bg-background py-16" />}>
      <RetrieveReportForm />
    </Suspense>
  );
}
