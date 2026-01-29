import { describe, expect, it } from 'vitest';

import { getFacetSummary, getPersonalDevelopmentRoadmap, getTraitMeaning, withPrefix } from '../lib/report-content';

describe('withPrefix', () => {
  it.each([
    { message: 'You show up prepared.', fallback: 'Fallback', expected: 'You show up prepared.' },
    { message: 'your energy is steady.', fallback: 'Fallback', expected: 'your energy is steady.' },
    { message: 'YOUR focus stays sharp.', fallback: 'Fallback', expected: 'YOUR focus stays sharp.' },
    { message: 'You, are prepared.', fallback: 'Fallback', expected: 'You, are prepared.' },
    { message: "You're prepared.", fallback: 'Fallback', expected: "You're prepared." },
    { message: 'You', fallback: 'Fallback', expected: 'You' },
    {
      message: 'youtube is a website.',
      fallback: 'You do this',
      expected: 'You do this: youtube is a website.'
    },
    {
      message: 'yourself is a pronoun.',
      fallback: 'You do this',
      expected: 'You do this: yourself is a pronoun.'
    },
    {
      message: 'you-tube is not the same as youtube.',
      fallback: 'You do this',
      expected: 'You do this: you-tube is not the same as youtube.'
    },
    {
      message: 'Focus on consistency.',
      fallback: 'You do more of this',
      expected: 'You do more of this: Focus on consistency.'
    }
  ])('should correctly process the message: $message', ({ message, fallback, expected }) => {
    expect(withPrefix(message, fallback)).toBe(expected);
  });
});

describe('getPersonalDevelopmentRoadmap', () => {
  it('uses existing you/your phrasing in strengths and growth tips', () => {
    const result = getPersonalDevelopmentRoadmap(
      { Openness: 85, Neuroticism: 20 },
      ['Openness', 'Neuroticism']
    );

    expect(result[0]?.items[0]).toBe('You absorb new ideas quickly and enjoy exploring novel perspectives.');
    expect(result[1]?.items[0]).toBe("You stay alert to risks so issues don't go unnoticed.");
  });
});

describe('getTraitMeaning', () => {
  it.each([
    {
      trait: 'openness',
      score: 85,
      expected:
        'Your Openness score is high. This trait shows up often and likely shapes how you think, feel, and act.'
    },
    {
      trait: 'Openness',
      score: 55,
      expected:
        'Your Openness score is medium. You can flex this trait depending on the situation, balancing it with other strengths.'
    },
    {
      trait: 'Openness',
      score: 20,
      expected: 'Your Openness score is low. You rely on this trait less, leaning on other qualities in most situations.'
    }
  ])('returns the expected narrative for $trait at $score', ({ trait, score, expected }) => {
    expect(getTraitMeaning(trait, score)).toBe(expected);
  });
});

describe('getFacetSummary', () => {
  it('uses least strong facet when the lowest score meets the threshold', () => {
    const summary = getFacetSummary('Openness', {
      Openness: {
        Imagination: 82,
        Adventurousness: 60
      }
    });

    expect(summary?.callouts).toEqual([
      'Your strongest facet: Imagination (82/100).',
      'Your least strong facet: Adventurousness (60/100).'
    ]);
  });

  it('uses weakest facet when the lowest score falls below the threshold', () => {
    const summary = getFacetSummary('Openness', {
      Openness: {
        Imagination: 82,
        Adventurousness: 59
      }
    });

    expect(summary?.callouts).toEqual([
      'Your strongest facet: Imagination (82/100).',
      'Your weakest facet: Adventurousness (59/100).'
    ]);
  });
});
