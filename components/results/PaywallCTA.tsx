'use client';

import { useEffect } from 'react';
import { trackEvent } from '../../lib/analytics';
import { CheckoutButton } from '../paywall/CheckoutButton';
import { Card } from '../ui/Card';

type PaywallCTAProps = {
  resultId: string;
};

export function PaywallCTA({ resultId }: PaywallCTAProps) {
  useEffect(() => {
    trackEvent('paywall_view', { resultId });
  }, [resultId]);

  return (
    <Card className="flex flex-col items-start justify-between gap-6 border-indigo-100 bg-indigo-50/70 p-6 shadow-sm md:flex-row md:items-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Premium report</p>
        <h2 className="text-2xl font-semibold text-slate-900">Unlock full report (PDF)</h2>
        <p className="text-sm text-slate-600">Get a personalized, shareable report with deep trait insights and tailored guidance.</p>
      </div>
      <CheckoutButton resultId={resultId} />
    </Card>
  );
}
