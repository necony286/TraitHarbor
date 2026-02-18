import ipip120Items from '../src/data/ipip120.json';
import ipip120Fixture from '../src/data/ipip120.fixture.json';
import ipip60Items from '../src/data/ipip60.json';
import facetMapping from '../src/data/ipip120.facets.json';

export type Trait = 'O' | 'C' | 'E' | 'A' | 'N';

export type QuizVariant = 'ipip120' | 'ipip60';

export type QuizItem = {
  id: string;
  prompt: string;
  trait: Trait;
  reverseKeyed: boolean;
  facetKey?: string;
  /** @deprecated use facetKey */
  facet?: string;
};

const facetLookup = (facetMapping as Record<string, string>) ?? {};
const fixtureItems = (ipip120Fixture as QuizItem[]) ?? [];
const variantItems: Record<QuizVariant, QuizItem[]> = {
  ipip120: (ipip120Items as QuizItem[]) ?? [],
  ipip60: (ipip60Items as QuizItem[]) ?? []
};

export const isQuizVariant = (value: unknown): value is QuizVariant =>
  value === 'ipip120' || value === 'ipip60';

export const resolveQuizVariant = (value?: unknown): QuizVariant =>
  isQuizVariant(value) ? value : 'ipip120';

const attachFacetKeys = (quizItems: QuizItem[], variant: QuizVariant) => {
  const withFacets = quizItems.map((item) => {
    const facetKey = facetLookup[item.id];
    if (!facetKey) {
      throw new Error(`Missing facetKey mapping for item ${item.id} (${variant}).`);
    }

    return { ...item, facetKey, facet: facetKey };
  });

  return withFacets;
};

export function loadQuizItems({ variant = 'ipip120' }: { variant?: QuizVariant } = {}): QuizItem[] {
  const useFixture = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE === '1';
  if (useFixture && fixtureItems.length > 0) {
    const scopedFixture = variant === 'ipip60' ? fixtureItems.slice(0, 6) : fixtureItems;
    return attachFacetKeys(scopedFixture, variant);
  }

  return attachFacetKeys(variantItems[variant], variant);
}

export function getTotalItems(variant?: QuizVariant) {
  return loadQuizItems({ variant }).length;
}
