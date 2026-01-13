import { PaywallCTA } from './PaywallCTA';
import { TraitChart } from './TraitChart';
import { TraitSummary } from './TraitSummary';
import { TraitScores } from './traitData';
import { Container } from '../ui/Container';
import { ResultsDisplay as FigmaResultsDisplay } from '../../src/components/figma/ResultsDisplay';

type ResultsDisplayProps = {
  traits: TraitScores;
  resultId: string;
};

export function ResultsDisplay({ traits, resultId }: ResultsDisplayProps) {
  return (
    <Container className="py-12">
      <FigmaResultsDisplay traits={traits}>
        <TraitChart scores={traits} />
        <PaywallCTA resultId={resultId} />
        <TraitSummary scores={traits} />
      </FigmaResultsDisplay>
    </Container>
  );
}
