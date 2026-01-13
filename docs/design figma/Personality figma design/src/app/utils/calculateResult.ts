import { questions } from '../data/questions';
import { personalityResults } from '../data/results';

export function calculateResult(answers: { [key: number]: number }) {
  const traits: { [key: string]: number } = {
    extraversion: 0,
    introversion: 0,
    intuition: 0,
    sensing: 0,
    thinking: 0,
    feeling: 0,
    judging: 0,
    perceiving: 0,
    balanced: 0
  };

  // Calculate trait scores based on answers
  Object.entries(answers).forEach(([questionIndex, optionIndex]) => {
    const question = questions[parseInt(questionIndex)];
    const selectedOption = question.options[optionIndex];
    traits[selectedOption.trait] = (traits[selectedOption.trait] || 0) + selectedOption.value;
  });

  // Determine dominant traits
  const isExtraverted = traits.extraversion > traits.introversion;
  const isIntroverted = traits.introversion > traits.extraversion;
  const isIntuitive = traits.intuition > traits.sensing;
  const isSensing = traits.sensing > traits.intuition;
  const isThinking = traits.thinking > traits.feeling;
  const isFeeling = traits.feeling > traits.thinking;
  const isJudging = traits.judging > traits.perceiving;
  const isPerceiving = traits.perceiving > traits.judging;
  const isBalanced = traits.balanced >= 3;

  // Determine personality type based on trait combinations
  let resultIndex = 7; // Default to "The Harmonizer" (balanced)

  if (isBalanced) {
    resultIndex = 7; // The Harmonizer
  } else if (isIntuitive && isPerceiving && (isExtraverted || !isIntroverted)) {
    resultIndex = 0; // The Visionary
  } else if (isThinking && isJudging && !isFeeling) {
    resultIndex = 1; // The Architect
  } else if (isIntuitive && isFeeling) {
    resultIndex = 2; // The Advocate
  } else if (isExtraverted && isThinking && isJudging) {
    resultIndex = 3; // The Commander
  } else if (isSensing && isPerceiving && (isIntroverted || !isExtraverted)) {
    resultIndex = 4; // The Craftsperson
  } else if (isSensing && isFeeling && isJudging) {
    resultIndex = 5; // The Guardian
  } else if (isExtraverted && isSensing && isPerceiving) {
    resultIndex = 6; // The Explorer
  }

  return personalityResults[resultIndex];
}
