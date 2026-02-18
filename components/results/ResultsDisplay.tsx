import { PaywallCTA } from './PaywallCTA';
import { TraitSummary } from './TraitSummary';
import { TraitScores } from './traitData';
import { Container } from '../ui/Container';
import { ResultsDisplay as FigmaResultsDisplay } from '../../src/components/figma/ResultsDisplay';
import type { QuizVariant } from '../../lib/ipip';

type ResultsDisplayProps = {
  traits: TraitScores;
  resultId: string;
  quizVariant: QuizVariant;
};

export function ResultsDisplay({ traits, resultId, quizVariant }: ResultsDisplayProps) {
  return (
    <Container className="py-12">
      <FigmaResultsDisplay traits={traits}>
        <PaywallCTA resultId={resultId} quizVariant={quizVariant} />
        <TraitSummary scores={traits} />
      </FigmaResultsDisplay>
    </Container>
  );
}
