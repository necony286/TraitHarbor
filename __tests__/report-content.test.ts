import { describe, expect, it } from 'vitest';

import {
  formatFacetLabel,
  getFacetSummary,
  getFacetSpread,
  getActionPlanSelections,
  getMicroHabitRecommendation,
  getPersonalDevelopmentRoadmap,
  getTraitSummary,
  getTraitMeaning,
  withPrefix
} from '../lib/report-content';

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
    expect(result.flatMap((block) => block.items).join(' ')).not.toContain(
      'You spend 7 days dedicating 10 minutes'
    );
  });
});

describe('getMicroHabitRecommendation', () => {
  it('returns an empty string when no traits are ranked', () => {
    expect(getMicroHabitRecommendation([])).toBe('');
  });

  it.each`
    name                                                                            | rankedTraits                                              | article | topTrait             | bottomTrait
    ${'builds a recommendation for a top trait starting with a vowel'}              | ${['Openness', 'Conscientiousness']}                      | ${'an'} | ${'Openness'}        | ${'Conscientiousness'}
    ${'builds a recommendation for a top trait starting with a consonant'}          | ${['Conscientiousness', 'Openness']}                      | ${'a'}  | ${'Conscientiousness'} | ${'Openness'}
    ${'builds a recommendation using the same trait when only one is provided'}     | ${['Openness']}                                           | ${'an'} | ${'Openness'}        | ${'Openness'}
    ${'builds a recommendation using the first and last traits from a longer list'} | ${['Agreeableness', 'Conscientiousness', 'Neuroticism']}   | ${'an'} | ${'Agreeableness'}   | ${'Neuroticism'}
  `('$name', ({ rankedTraits, article, topTrait, bottomTrait }) => {
    const expected = `You spend 7 days dedicating 10 minutes to ${article} ${topTrait}-aligned action each morning, then end the day by naming one ${bottomTrait}-related moment you handled with care.`;
    expect(getMicroHabitRecommendation(rankedTraits)).toBe(expected);
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
        'Your Openness score is balanced. You can flex this trait depending on the situation, balancing it with other strengths.'
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

describe('getTraitSummary', () => {
  it.each([
    {
      description: 'an unknown trait',
      trait: 'SomeUnknownTrait',
      score: 30,
      expected: 'Overall, your SomeUnknownTrait is low.'
    },
    {
      description: 'a known trait (lowercase)',
      trait: 'openness',
      score: 80,
      expected: 'Overall, your Openness is high.'
    },
    {
      description: 'a known trait (PascalCase)',
      trait: 'Openness',
      score: 55,
      expected: 'Overall, your Openness is balanced.'
    },
    {
      description: 'a known trait with whitespace',
      trait: ' conscientiousness ',
      score: 20,
      expected: 'Overall, your Conscientiousness is low.'
    }
  ])('should use the correct trait name for $description', ({ trait, score, expected }) => {
    const summary = getTraitSummary(trait, score);

    expect(summary).toBe(expected);
  });

  it('should include facet details when available', () => {
    const facetScores = {
      Openness: {
        O1_Imagination: 82,
        O4_Adventurousness: 59
      }
    };
    const summary = getTraitSummary('openness', 80, facetScores);

    expect(summary).toBe(
      'Openness shows its strongest facet in Imagination, while your weakest facet is Adventurousness. Overall, your Openness is high.'
    );
  });
});

describe('formatFacetLabel', () => {
  it.each([
    { raw: 'O1_Imagination', expected: 'Imagination' },
    { raw: 'O4_Adventurousness', expected: 'Adventurousness' },
    { raw: 'C6_achievemenT_Striving', expected: 'Achievement striving' },
    { raw: 'Agreeableness', expected: 'Agreeableness' },
    { raw: 'Warmth', expected: 'Warmth' },
    { raw: 'SelfConsciousness', expected: 'Self consciousness' },
    { raw: 'self-consciousness', expected: 'Self-consciousness' },
    { raw: '  ', expected: '' }
  ])('formats "$raw" into "$expected"', ({ raw, expected }) => {
    expect(formatFacetLabel(raw)).toBe(expected);
  });
});

describe('getFacetSummary', () => {
  const strongestFacetName = 'Imagination';
  const strongestFacetScore = 82;
  const lowestFacetName = 'Adventurousness';

  it.each([
    { score: 60, label: 'least strong facet', description: 'meets the threshold' },
    { score: 59, label: 'weakest facet', description: 'falls below the threshold' }
  ])('uses $label when the lowest score $description ($score)', ({ score, label }) => {
    const summary = getFacetSummary('Openness', {
      Openness: {
        [strongestFacetName]: strongestFacetScore,
        [lowestFacetName]: score
      }
    });

    expect(summary?.callouts).toEqual([
      `Your strongest facet: ${strongestFacetName} (${strongestFacetScore}/100).`,
      `Your ${label}: ${lowestFacetName} (${score}/100).`
    ]);
  });

  it('formats coded facet labels for callouts', () => {
    const summary = getFacetSummary('Openness', {
      Openness: {
        O1_Imagination: 82,
        O4_Adventurousness: 59
      }
    });

    expect(summary?.callouts).toEqual([
      'Your strongest facet: Imagination (82/100).',
      'Your weakest facet: Adventurousness (59/100).'
    ]);
  });
});

describe('getFacetSpread', () => {
  it.each([
    {
      label: 'Even',
      scores: { Imagination: 50, Adventurousness: 55, ArtisticInterests: 60 },
      expected: { range: 10, stdev: 4.1 }
    },
    {
      label: 'Mixed',
      scores: { Imagination: 40, Adventurousness: 50, ArtisticInterests: 65 },
      expected: { range: 25, stdev: 10.3 }
    },
    {
      label: 'Spiky',
      scores: { Imagination: 30, Adventurousness: 60, ArtisticInterests: 90 },
      expected: { range: 60, stdev: 24.5 }
    }
  ])('returns $label for the facet score spread', ({ label, scores, expected }) => {
    const summary = getFacetSpread('Openness', { Openness: scores });

    expect(summary?.label).toBe(label);
    expect(summary?.range).toBe(expected.range);
    expect(summary?.stdev).toBe(expected.stdev);
    expect(summary?.description).toContain(`(Range ${expected.range}, stdev ${expected.stdev}.)`);
  });
});

describe('getActionPlanSelections', () => {
  it('uses the lowest finite trait percentage as support', () => {
    const selections = getActionPlanSelections(
      { Openness: 78, Conscientiousness: 22, Extraversion: 35 },
      ['Openness', 'Conscientiousness', 'Extraversion', 'Neuroticism']
    );

    expect(selections.leanInto).toBe('Openness');
    expect(selections.support).toBe('Conscientiousness');
    expect(selections.stressReset).toBe('Neuroticism');
  });

  it('falls back to lean-into when no finite trait percentages are available', () => {
    const selections = getActionPlanSelections(
      { Openness: Number.NaN, Conscientiousness: Number.POSITIVE_INFINITY },
      ['Openness', 'Conscientiousness']
    );

    expect(selections.leanInto).toBe('Openness');
    expect(selections.support).toBe('Openness');
    expect(selections.stressReset).toBe('Neuroticism');
  });

  it('uses the last ranked trait when no percentages are provided', () => {
    const selections = getActionPlanSelections({}, ['Openness', 'Extraversion', 'Agreeableness']);

    expect(selections.leanInto).toBe('Openness');
    expect(selections.support).toBe('Agreeableness');
    expect(selections.stressReset).toBe('Neuroticism');
  });
});
