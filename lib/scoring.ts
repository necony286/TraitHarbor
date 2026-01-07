import { QuizItem } from './ipip';

type Trait = 'O' | 'C' | 'E' | 'A' | 'N';

export type AnswerMap = Record<string, number>;
export type TraitScores = Record<Trait, number>;

export type ScoreResult = {
  traits: TraitScores;
  raw: TraitScores;
  counts: TraitScores;
};

const TRAITS: Trait[] = ['O', 'C', 'E', 'A', 'N'];

const emptyTraitScores = (): TraitScores => ({
  O: 0,
  C: 0,
  E: 0,
  A: 0,
  N: 0
});

export const mapLikertToScore = (value: number) => value - 3;

export const normalizeScore = (raw: number, count: number) => {
  if (count === 0) return 0;
  const min = -2 * count;
  const max = 2 * count;
  const normalized = ((raw - min) / (max - min)) * 100;
  return Math.round(normalized * 100) / 100;
};

export const getMissingAnswerIds = (answers: AnswerMap, items: QuizItem[]) =>
  items.filter((item) => answers[item.id] === undefined).map((item) => item.id);

export const scoreAnswers = (answers: AnswerMap, items: QuizItem[]): ScoreResult => {
  const raw = emptyTraitScores();
  const counts = emptyTraitScores();

  items.forEach((item) => {
    counts[item.trait] += 1;
    const answer = answers[item.id];
    if (answer === undefined) return;
    const mapped = mapLikertToScore(answer);
    const adjusted = item.reverseKeyed ? -mapped : mapped;
    raw[item.trait] += adjusted;
  });

  const traits = TRAITS.reduce<TraitScores>((accumulator, trait) => {
    accumulator[trait] = normalizeScore(raw[trait], counts[trait]);
    return accumulator;
  }, emptyTraitScores());

  return { traits, raw, counts };
};

export const scoringFixtureItems: QuizItem[] = [
  { id: 'O1', prompt: 'I am quick to imagine new ideas.', trait: 'O', reverseKeyed: false },
  { id: 'O2', prompt: 'I avoid unfamiliar ideas.', trait: 'O', reverseKeyed: true },
  { id: 'C1', prompt: 'I like to plan ahead.', trait: 'C', reverseKeyed: false },
  { id: 'C2', prompt: 'I leave my schedule open.', trait: 'C', reverseKeyed: true },
  { id: 'E1', prompt: 'I enjoy being around others.', trait: 'E', reverseKeyed: false },
  { id: 'E2', prompt: 'I prefer quiet evenings alone.', trait: 'E', reverseKeyed: true },
  { id: 'A1', prompt: 'I feel empathy for others.', trait: 'A', reverseKeyed: false },
  { id: 'A2', prompt: 'I am indifferent to others feelings.', trait: 'A', reverseKeyed: true },
  { id: 'N1', prompt: 'I worry about things often.', trait: 'N', reverseKeyed: false },
  { id: 'N2', prompt: 'I stay calm under pressure.', trait: 'N', reverseKeyed: true }
];

export const scoringFixtures = [
  {
    name: 'high',
    items: scoringFixtureItems,
    answers: {
      O1: 5,
      O2: 1,
      C1: 5,
      C2: 1,
      E1: 5,
      E2: 1,
      A1: 5,
      A2: 1,
      N1: 5,
      N2: 1
    },
    expected: {
      O: 100,
      C: 100,
      E: 100,
      A: 100,
      N: 100
    }
  },
  {
    name: 'neutral',
    items: scoringFixtureItems,
    answers: {
      O1: 3,
      O2: 3,
      C1: 3,
      C2: 3,
      E1: 3,
      E2: 3,
      A1: 3,
      A2: 3,
      N1: 3,
      N2: 3
    },
    expected: {
      O: 50,
      C: 50,
      E: 50,
      A: 50,
      N: 50
    }
  },
  {
    name: 'low',
    items: scoringFixtureItems,
    answers: {
      O1: 1,
      O2: 5,
      C1: 1,
      C2: 5,
      E1: 1,
      E2: 5,
      A1: 1,
      A2: 5,
      N1: 1,
      N2: 5
    },
    expected: {
      O: 0,
      C: 0,
      E: 0,
      A: 0,
      N: 0
    }
  }
];
