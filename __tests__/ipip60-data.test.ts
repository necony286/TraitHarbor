import { describe, expect, it } from 'vitest';
import ipip60 from '../src/data/ipip60.json';
import facetMap from '../src/data/ipip120.facets.json';
import { generateIpip60Json } from '../scripts/generate-ipip60';

type QuizItem = {
  id: string;
};

describe('IPIP-60 data integrity', () => {
  const items = (ipip60 as QuizItem[]) ?? [];
  const mapping = (facetMap as Record<string, string>) ?? {};

  it('contains exactly 60 items', () => {
    expect(items).toHaveLength(60);
  });

  it('contains exactly 30 facets with 2 items each', () => {
    const counts = items.reduce<Record<string, number>>((acc, item) => {
      const facetKey = mapping[item.id];
      expect(facetKey).toBeTruthy();
      acc[facetKey] = (acc[facetKey] ?? 0) + 1;
      return acc;
    }, {});

    expect(Object.keys(counts)).toHaveLength(30);
    Object.values(counts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('matches deterministic generator output', () => {
    expect(items).toEqual(generateIpip60Json());
  });
});
