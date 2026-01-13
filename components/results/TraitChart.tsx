import { TRAIT_DETAILS, TRAIT_ORDER, TraitScores } from './traitData';
import { Card } from '../ui/Card';

type TraitChartProps = {
  scores: TraitScores;
};

export function TraitChart({ scores }: TraitChartProps) {
  return (
    <Card as="section" className="gap-4 border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-indigo-100/40" aria-label="Your TraitHarbor scores">
      {TRAIT_ORDER.map((trait) => {
        const details = TRAIT_DETAILS[trait];
        const score = scores[trait] ?? 0;

        return (
          <div className="flex flex-col gap-2" key={trait}>
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>{details.label}</span>
              <span className="text-slate-500">{Math.round(score)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
