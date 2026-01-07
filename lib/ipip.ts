import ipipItems from '../src/data/ipip120.json';
import ipipFixture from '../src/data/ipip120.fixture.json';

type Trait = 'O' | 'C' | 'E' | 'A' | 'N';

export type QuizItem = {
  id: string;
  prompt: string;
  trait: Trait;
  reverseKeyed: boolean;
};

const items = (ipipItems as QuizItem[]) ?? [];
const fixtureItems = (ipipFixture as QuizItem[]) ?? [];

export function loadQuizItems(): QuizItem[] {
  const useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';
  if (useFixture && fixtureItems.length > 0) {
    return fixtureItems;
  }

  return items;
}

export function getTotalItems() {
  return loadQuizItems().length;
}
