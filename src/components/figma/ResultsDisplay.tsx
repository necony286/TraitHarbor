import type { ReactNode } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { Container } from '../../../components/ui/Container';
import { TRAIT_DETAILS, TRAIT_ORDER, type TraitScores } from '../../../components/results/traitData';
interface ResultsDisplayProps {
  traits: TraitScores;
  children: ReactNode;
}

export function ResultsDisplay({ traits, children }: ResultsDisplayProps) {
  return (
    <Container as="section" className="flex w-full flex-col gap-10">
      <Card className="shadow-sm">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="mx-auto">
              Your results
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-foreground sm:text-4xl">
                TraitHarbor personality snapshot
              </h1>
              <p className="text-base text-muted-foreground">
                Here is a quick look at your scores. Each trait is scored from 0–100 based on the IPIP-120 assessment.
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {TRAIT_ORDER.map((trait) => {
              const details = TRAIT_DETAILS[trait];
              const score = traits[trait] ?? 0;

              return (
                <div className="flex flex-col gap-2" key={trait}>
                  <div className="flex items-center justify-between text-sm font-medium text-foreground">
                    <span>{details.label}</span>
                    <span className="text-muted-foreground">{Math.round(score)}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-brand-strong"
                      style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">{children}</div>
    </Container>
  );
}
