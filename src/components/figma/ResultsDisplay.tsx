import type { ReactNode } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { Container } from '../../../components/ui/Container';
import { type TraitScores } from '../../../components/results/traitData';
import { TraitBars } from '../../../components/results/TraitBars';
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
            <TraitBars scores={traits} />
          </div>

        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">{children}</div>
    </Container>
  );
}
