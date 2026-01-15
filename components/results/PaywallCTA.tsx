'use client';

import { useEffect } from 'react';
import { trackEvent } from '../../lib/analytics';
import { CheckoutButton } from '../paywall/CheckoutButton';
import { Badge } from '@/components/figma/ui/badge';
import { Card, CardContent } from '@/components/figma/ui/card';

type PaywallCTAProps = {
  resultId: string;
};

export function PaywallCTA({ resultId }: PaywallCTAProps) {
  useEffect(() => {
    trackEvent('paywall_view', { resultId });
  }, [resultId]);

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <Badge variant="secondary">Premium report</Badge>
          <h2 className="text-2xl font-semibold text-foreground">Unlock full report (PDF)</h2>
          <p className="text-sm text-muted-foreground">
            Get a personalized, shareable report with deep trait insights and tailored guidance.
          </p>
        </div>
        <CheckoutButton resultId={resultId} />
      </CardContent>
    </Card>
  );
}
