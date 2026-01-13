import { TRAIT_DETAILS, TRAIT_ORDER, TraitScores } from './traitData';
import { Card } from '../ui/Card';

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
          <Card as="article" key={trait} className="trait-summary__card">
            <header>
              <p className="eyebrow">{details.label}</p>
              <h3>
                {Math.round(score)}% {details.label}
              </h3>
            </header>
            <p className="muted">{details.description}</p>
            <ul>
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
