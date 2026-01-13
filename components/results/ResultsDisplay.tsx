import { PaywallCTA } from './PaywallCTA';
import { TraitChart } from './TraitChart';
import { TraitSummary } from './TraitSummary';
import { TraitScores } from './traitData';
import { Container } from '../ui/Container';

type ResultsDisplayProps = {
  traits: TraitScores;
  resultId: string;
};

export function ResultsDisplay({ traits, resultId }: ResultsDisplayProps) {
  return (
    <Container className="results">
      <header className="results__header">
        <p className="eyebrow">Your results</p>
        <h1>TraitHarbor personality snapshot</h1>
        <p className="muted">
          Here is a quick look at your scores. Each trait is scored from 0–100 based on the IPIP-120 assessment.
        </p>
      </header>

      <TraitChart scores={traits} />

      <PaywallCTA resultId={resultId} />

      <TraitSummary scores={traits} />
    </Container>
  );
}
