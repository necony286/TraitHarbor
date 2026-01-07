import { TRAIT_DETAILS, TraitKey } from './traitData';

type TraitScores = Record<TraitKey, number>;

const TRAIT_ORDER: TraitKey[] = ['O', 'C', 'E', 'A', 'N'];

type TraitSummaryProps = {
  scores: TraitScores;
};

export function TraitSummary({ scores }: TraitSummaryProps) {
  return (
    <section className="trait-summary">
      {TRAIT_ORDER.map((trait) => {
        const details = TRAIT_DETAILS[trait];
        const score = scores[trait] ?? 0;

        return (
          <article key={trait} className="trait-summary__card">
            <header>
              <p className="eyebrow">{details.label}</p>
              <h3>
                {Math.round(score)}% {details.label}
              </h3>
            </header>
            <p className="muted">{details.description}</p>
            <ul>
              {details.guidance.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
