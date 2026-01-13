import { TRAIT_DETAILS, TRAIT_ORDER, TraitScores } from './traitData';
import { Card } from '../ui/Card';

type TraitSummaryProps = {
  scores: TraitScores;
};

export function TraitSummary({ scores }: TraitSummaryProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {TRAIT_ORDER.map((trait) => {
        const details = TRAIT_DETAILS[trait];
        const score = scores[trait] ?? 0;

        return (
          <Card as="article" key={trait} className="gap-4 border-slate-200/80 bg-white/90 p-6 shadow-sm">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{details.label}</p>
              <h3 className="text-lg font-semibold text-slate-900">
                {Math.round(score)}% {details.label}
              </h3>
            </header>
            <p className="text-sm text-slate-600">{details.description}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {details.guidance.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </Card>
        );
      })}
    </section>
  );
}
