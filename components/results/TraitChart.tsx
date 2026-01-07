import { TRAIT_DETAILS, TRAIT_ORDER, TraitKey } from './traitData';

type TraitScores = Record<TraitKey, number>;

type TraitChartProps = {
  scores: TraitScores;
};

export function TraitChart({ scores }: TraitChartProps) {
  return (
    <section className="trait-chart" aria-label="Your Big Five scores">
      {TRAIT_ORDER.map((trait) => {
        const details = TRAIT_DETAILS[trait];
        const score = scores[trait] ?? 0;

        return (
          <div className="trait-chart__row" key={trait}>
            <div className="trait-chart__label">
              <span className="trait-chart__trait">{details.label}</span>
              <span className="trait-chart__score">{Math.round(score)}%</span>
            </div>
            <div className="trait-chart__bar" role="presentation">
              <div className="trait-chart__fill" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
