export type TraitScore = {
  name: string;
  score: number;
};

export type TraitExtremes = {
  highestTraits: string[];
  lowestTraits: string[];
  maxScore: number;
  minScore: number;
  allScoresEqual: boolean;
};

export const getTraitExtremes = (traits: TraitScore[]): TraitExtremes => {
  if (!traits.length) {
    return {
      highestTraits: [],
      lowestTraits: [],
      maxScore: 0,
      minScore: 0,
      allScoresEqual: true
    };
  }

  const scores = traits.map(({ score }) => score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const allScoresEqual = maxScore === minScore;

  return {
    highestTraits: traits.filter(({ score }) => score === maxScore).map(({ name }) => name),
    lowestTraits: traits.filter(({ score }) => score === minScore).map(({ name }) => name),
    maxScore,
    minScore,
    allScoresEqual
  };
};
