import { type TraitScores } from './traitData';
import { Card } from '../ui/Card';
import { TraitBars } from './TraitBars';

type TraitChartProps = {
  scores: TraitScores;
};

export function TraitChart({ scores }: TraitChartProps) {
  return (
    <Card as="section" className="gap-5 p-6" aria-label="Your TraitHarbor scores">
      <TraitBars scores={scores} />
    </Card>
  );
}
