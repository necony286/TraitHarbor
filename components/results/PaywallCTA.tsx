'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '../../lib/analytics';
import { CheckoutButton } from '../paywall/CheckoutButton';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import type { QuizVariant } from '../../lib/ipip';

type PaywallCTAProps = {
  resultId: string;
  quizVariant: QuizVariant;
};

export function PaywallCTA({ resultId, quizVariant }: PaywallCTAProps) {
  useEffect(() => {
    trackEvent('paywall_view', { resultId, quizVariant });
  }, [quizVariant, resultId]);

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <Badge variant="secondary">Premium report</Badge>
          <h2 className="text-2xl font-semibold text-foreground">Unlock full report (PDF)</h2>
          <p className="text-sm text-muted-foreground">
            Get a personalized, shareable report with deep trait insights and tailored guidance.
          </p>
          {quizVariant === 'ipip60' ? (
            <p className="text-sm text-slate-700">
              Want more detail first?{' '}
              <Link href="/quiz" className="font-semibold text-indigo-700 underline underline-offset-2">
                Go deeper (Pro): 120 questions
              </Link>
            </p>
          ) : null}
        </div>
        <CheckoutButton resultId={resultId} />
      </CardContent>
    </Card>
  );
}
