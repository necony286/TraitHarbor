import { TRAIT_DETAILS, TRAIT_ORDER, TraitScores } from './traitData';
import { Card } from '../ui/Card';

type TraitChartProps = {
  scores: TraitScores;
};

export function TraitChart({ scores }: TraitChartProps) {
  return (
    <Card as="section" className="gap-5 p-6" aria-label="Your TraitHarbor scores">
      {TRAIT_ORDER.map((trait) => {
        const details = TRAIT_DETAILS[trait];
        const score = scores[trait] ?? 0;

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
    </Card>
  );
}
