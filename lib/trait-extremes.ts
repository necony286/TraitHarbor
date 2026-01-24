export type TraitScore = {
  name: string;
  score: number;
};

export type TraitExtremes = {
  highestTraits: string[];
  lowestTraits: string[];
  maxScore: number;
  minScore: number;
  scoreSpread: number;
  isBalanced: boolean;
  allScoresEqual: boolean;
};

export const DEFAULT_BALANCE_THRESHOLD = 8;

export const getTraitExtremes = (
  traits: TraitScore[],
  balanceThreshold = DEFAULT_BALANCE_THRESHOLD
): TraitExtremes => {
  if (!traits.length) {
    return {
      highestTraits: [],
      lowestTraits: [],
      maxScore: 0,
      minScore: 0,
      scoreSpread: 0,
      isBalanced: true,
      allScoresEqual: true
    };
  }

  const scores = traits.map(({ score }) => score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const scoreSpread = maxScore - minScore;
  const isBalanced = scoreSpread < balanceThreshold;
  const allScoresEqual = maxScore === minScore;

  return {
    highestTraits: traits.filter(({ score }) => score === maxScore).map(({ name }) => name),
    lowestTraits: traits.filter(({ score }) => score === minScore).map(({ name }) => name),
    maxScore,
    minScore,
    scoreSpread,
    isBalanced,
    allScoresEqual
  };
};
