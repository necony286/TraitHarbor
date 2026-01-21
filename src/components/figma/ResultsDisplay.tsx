import type { ReactNode } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { TRAIT_DETAILS, TRAIT_ORDER, type TraitScores } from '../../../components/results/traitData';

interface ResultsDisplayProps {
  traits: TraitScores;
  children: ReactNode;
}

export function ResultsDisplay({ traits, children }: ResultsDisplayProps) {
  const keyTraits = [...TRAIT_ORDER]
    .map((trait) => ({
      id: trait,
      label: TRAIT_DETAILS[trait].label,
      score: traits[trait] ?? 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
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

          <div className="mt-8">
            <h2 className="text-left text-lg font-medium text-foreground">Your key traits</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {keyTraits.map((trait) => (
                <div
                  key={trait.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground"
                >
                  <span>{trait.label}</span>
                  <span className="text-primary">{Math.round(trait.score)}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
