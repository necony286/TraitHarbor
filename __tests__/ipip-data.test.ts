import { describe, expect, it } from 'vitest';
import { loadQuizItems } from '../lib/ipip';

const reverseKeyedItems = new Set([
  9, 19, 24, 30, 39, 40, 48, 49, 51, 53, 54, 60, 62, 67, 68, 69, 70, 73, 74, 75, 78, 79,
  80, 81, 83, 84, 85, 88, 89, 90, 92, 94, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106,
  107, 108, 109, 110, 111, 113, 114, 115, 116, 118, 119, 120
]);

const traitCycle = ['N', 'E', 'O', 'A', 'C'] as const;

const facetNames = [
  'N1_Anxiety',
  'E1_Friendliness',
  'O1_Imagination',
  'A1_Trust',
  'C1_SelfEfficacy',
  'N2_Anger',
  'E2_Gregariousness',
  'O2_ArtisticInterests',
  'A2_Morality',
  'C2_Orderliness',
  'N3_Depression',
  'E3_Assertiveness',
  'O3_Emotionality',
  'A3_Altruism',
  'C3_Dutifulness',
  'N4_SelfConsciousness',
  'E4_ActivityLevel',
  'O4_Adventurousness',
  'A4_Cooperation',
  'C4_AchievementStriving',
  'N5_Immoderation',
  'E5_ExcitementSeeking',
  'O5_Intellect',
  'A5_Modesty',
  'C5_SelfDiscipline',
  'N6_Vulnerability',
  'E6_Cheerfulness',
  'O6_Liberalism',
  'A6_Sympathy',
  'C6_Cautiousness'
];

describe('IPIP-120 data integrity', () => {
  const items = loadQuizItems();

  it('contains exactly 120 items', () => {
    expect(items).toHaveLength(120);
  });

  it('has 24 items per domain', () => {
    const counts = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.trait] = (acc[item.trait] ?? 0) + 1;
      return acc;
    }, {});

    traitCycle.forEach((trait) => {
      expect(counts[trait]).toBe(24);
    });
  });

  it('assigns the correct trait and reverseKeyed flag per item number', () => {
    items.forEach((item, index) => {
      const itemNumber = index + 1;
      const expectedTrait = traitCycle[(itemNumber - 1) % traitCycle.length];
      expect(item.trait).toBe(expectedTrait);
      expect(item.reverseKeyed).toBe(reverseKeyedItems.has(itemNumber));
    });
  });

  it('spot-checks known items for trait and reverse keying', () => {
    const byId = new Map(items.map((item) => [item.id, item]));
    expect(byId.get('Q1')?.trait).toBe('N');
    expect(byId.get('Q1')?.reverseKeyed).toBe(false);
    expect(byId.get('Q2')?.trait).toBe('E');
    expect(byId.get('Q2')?.reverseKeyed).toBe(false);
    expect(byId.get('Q9')?.trait).toBe('A');
    expect(byId.get('Q9')?.reverseKeyed).toBe(true);
    expect(byId.get('Q10')?.trait).toBe('C');
    expect(byId.get('Q10')?.reverseKeyed).toBe(false);
    expect(byId.get('Q30')?.trait).toBe('C');
    expect(byId.get('Q30')?.reverseKeyed).toBe(true);
  });

  it('ensures every facet has exactly four items', () => {
    const counts = items.reduce<Record<string, number>>((acc, item) => {
      if (!item.facetKey) {
        return acc;
      }
      acc[item.facetKey] = (acc[item.facetKey] ?? 0) + 1;
      return acc;
    }, {});

    facetNames.forEach((facet) => {
      expect(counts[facet]).toBe(4);
    });
  });

  it('does not reverse-key any unexpected items', () => {
    const reversed = items
      .map((item, index) => ({ item, number: index + 1 }))
      .filter(({ item }) => item.reverseKeyed)
      .map(({ number }) => number);

    expect(reversed.sort((a, b) => a - b)).toEqual(Array.from(reverseKeyedItems).sort((a, b) => a - b));
  });
});
