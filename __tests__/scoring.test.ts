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
    const expectedMissing = ['O2', 'C1', 'C2', 'E1', 'E2', 'A1', 'A2', 'N1', 'N2'];
    expect(missing.sort()).toEqual(expectedMissing.sort());
    expect(missing).toHaveLength(expectedMissing.length);
  });
});
