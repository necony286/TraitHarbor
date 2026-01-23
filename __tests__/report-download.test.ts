import { describe, expect, it } from 'vitest';

import { buildReportTraitData } from '../lib/report-download';

describe('buildReportTraitData', () => {
  it('should correctly rank traits and handle ties using original order', () => {
    const traits = { O: 80, C: 90, E: 80, A: 70, N: 60 };
    const result = buildReportTraitData(traits);

    expect(result.traitRankOrder).toEqual([
      'Conscientiousness',
      'Openness',
      'Extraversion',
      'Agreeableness',
      'Neuroticism'
    ]);
    expect(result.highestTrait).toBe('Conscientiousness');
    expect(result.lowestTrait).toBe('Neuroticism');
    expect(result.traitPercentages).toEqual({
      Openness: 80,
      Conscientiousness: 90,
      Extraversion: 80,
      Agreeableness: 70,
      Neuroticism: 60
    });
  });

  it('should preserve section order when all scores are tied', () => {
    const traits = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    const result = buildReportTraitData(traits);

    expect(result.traitRankOrder).toEqual([
      'Openness',
      'Conscientiousness',
      'Extraversion',
      'Agreeableness',
      'Neuroticism'
    ]);
    expect(result.highestTrait).toBe('Openness');
    expect(result.lowestTrait).toBe('Neuroticism');
    expect(result.traitPercentages).toEqual({
      Openness: 50,
      Conscientiousness: 50,
      Extraversion: 50,
      Agreeableness: 50,
      Neuroticism: 50
    });
  });
});
