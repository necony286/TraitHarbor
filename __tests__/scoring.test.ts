import { describe, expect, it } from 'vitest';
import { getMissingAnswerIds, scoreAnswers, scoringFixtures, scoringFixtureItems } from '../lib/scoring';

describe('scoring fixtures', () => {
  scoringFixtures.forEach((fixture) => {
    it(`scores ${fixture.name} fixtures as expected`, () => {
      const result = scoreAnswers(fixture.answers, fixture.items);
      expect(result.traits).toEqual(fixture.expected);
    });
  });
});

describe('scoring validation', () => {
  it('reports missing answers', () => {
    const missing = getMissingAnswerIds({ O1: 3 }, scoringFixtureItems);
    expect(missing).toContain('O2');
    expect(missing).toContain('N2');
  });
});
