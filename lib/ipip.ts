import ipipItems from '../src/data/ipip120.json';
import ipipFixture from '../src/data/ipip120.fixture.json';
import facetMapping from '../src/data/ipip120.facets.json';

type Trait = 'O' | 'C' | 'E' | 'A' | 'N';
const traits: Trait[] = ['O', 'C', 'E', 'A', 'N'];

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

const attachFacets = (quizItems: QuizItem[]) => {
  const withFacets = quizItems.map((item) => {
    const facet = facetLookup[item.id];
    if (!facet) {
      return item;
    }
    return { ...item, facet };
  });
  if (process.env.NODE_ENV !== 'production') {
    const missing = withFacets.filter((item) => !item.facet);
    if (missing.length > 0) {
      const sampleIds = missing.slice(0, 5).map((item) => item.id);
      const missingByTrait = missing.reduce(
        (acc, item) => {
          acc[item.trait] = (acc[item.trait] ?? 0) + 1;
          return acc;
        },
        Object.fromEntries(traits.map((trait) => [trait, 0])) as Record<
          Trait,
          number
        >
      );
      console.warn(
        `[ipip] Missing facet mappings for ${missing.length} quiz items. Sample IDs: ${sampleIds.join(', ')}. Missing by trait: ${JSON.stringify(missingByTrait)}.`
      );
      if (
        process.env.NODE_ENV === 'test' ||
        process.env.NODE_ENV === 'development'
      ) {
        throw new Error(
          `Missing facet mappings for ${missing.length} quiz items.`
        );
      }
    }
  }
  return withFacets;
};

export function loadQuizItems(): QuizItem[] {
  const useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';
  if (useFixture && fixtureItems.length > 0) {
    return attachFacets(fixtureItems);
  }

  return attachFacets(items);
}

export function getTotalItems() {
  return loadQuizItems().length;
}
