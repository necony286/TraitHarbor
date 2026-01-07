'use client';

import { useEffect } from 'react';
import { trackEvent } from '../../lib/analytics';

type PaywallCTAProps = {
  resultId: string;
};

export function PaywallCTA({ resultId }: PaywallCTAProps) {
  useEffect(() => {
    trackEvent('paywall_view', { resultId });
  }, [resultId]);

  const handleClick = () => {
    alert('Checkout is coming next. You will be able to unlock your full PDF report soon.');
  };

  return (
    <div className="paywall-cta">
      <div>
        <p className="eyebrow">Premium report</p>
        <h2>Unlock full report (PDF)</h2>
        <p className="muted">Get a personalized, shareable report with deep trait insights and tailored guidance.</p>
      </div>
      <button className="button" type="button" onClick={handleClick}>
        Unlock full report (PDF)
      </button>
    </div>
  );
}
