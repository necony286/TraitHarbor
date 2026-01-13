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
    <Card className="paywall-cta">
      <div>
        <p className="eyebrow">Premium report</p>
        <h2>Unlock full report (PDF)</h2>
        <p className="muted">Get a personalized, shareable report with deep trait insights and tailored guidance.</p>
      </div>
      <CheckoutButton resultId={resultId} />
    </Card>
  );
}
