import { describe, expect, it } from 'vitest';

import { getPersonalDevelopmentRoadmap, withPrefix } from '../lib/report-content';

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
    expect(result[1]?.items[0]).toBe('You stay alert to risks so issues don\\'t go unnoticed.');
  });
});
