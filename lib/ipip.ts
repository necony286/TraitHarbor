import ipipItems from '../src/data/ipip120.json';
import ipipFixture from '../src/data/ipip120.fixture.json';
import facetMapping from '../src/data/ipip120.facets.json';

type Trait = 'O' | 'C' | 'E' | 'A' | 'N';

export type QuizItem = {
  id: string;
  prompt: string;
  trait: Trait;
  reverseKeyed: boolean;
  facet?: string;
};

const items = (ipipItems as QuizItem[]) ?? [];
const fixtureItems = (ipipFixture as QuizItem[]) ?? [];
const facetLookup = (facetMapping as Record<string, string>) ?? {};

const attachFacets = (quizItems: QuizItem[]) =>
  quizItems.map((item) => {
    const facet = facetLookup[item.id];
    if (!facet) {
      return item;
    }
    return { ...item, facet };
  });

export function loadQuizItems(): QuizItem[] {
  const useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';
  if (useFixture && fixtureItems.length > 0) {
    return fixtureItems;
  }

  return attachFacets(items);
}

export function getTotalItems() {
  return loadQuizItems().length;
}
