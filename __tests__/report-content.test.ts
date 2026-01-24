import { describe, expect, it } from 'vitest';

import { getPersonalDevelopmentRoadmap, withPrefix } from '../lib/report-content';

describe('withPrefix', () => {
  it('keeps existing you/your prefixes in any casing', () => {
    expect(withPrefix('You show up prepared.', 'Fallback')).toBe('You show up prepared.');
    expect(withPrefix('your energy is steady.', 'Fallback')).toBe('your energy is steady.');
    expect(withPrefix('YOUR focus stays sharp.', 'Fallback')).toBe('YOUR focus stays sharp.');
  });

  it('adds the fallback prefix when none is present', () => {
    expect(withPrefix('Focus on consistency.', 'You do more of this')).toBe(
      'You do more of this: Focus on consistency.'
    );
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
