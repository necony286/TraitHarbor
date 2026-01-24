import { describe, expect, it } from 'vitest';
import { getScoreBandLabel } from '../lib/report-content';
import { buildReportHtml, traitSectionOrder, type ReportTraits } from '../lib/pdf';

describe('report template', () => {
  it('hydrates report html with trait scores', async () => {
    const traits: ReportTraits = {
      O: 85,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const html = await buildReportHtml({
      name: 'Alex',
      date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
      traits,
      traitPercentages: {
        Openness: traits.O,
        Conscientiousness: traits.C,
        Extraversion: traits.E,
        Agreeableness: traits.A,
        Neuroticism: traits.N
      },
      highestTrait: 'Openness',
      lowestTrait: 'Neuroticism',
      traitRankOrder: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']
    });

    expect(html).toContain('Your Personality Profile');
    expect(html).not.toContain('{{trait_sections}}');
    const expectedTraits = traitSectionOrder.map(({ name, scoreKey }) => ({
      name,
      score: traits[scoreKey]
    }));

    for (const trait of expectedTraits) {
      const band = getScoreBandLabel(trait.score);
      expect(html).toContain(`${trait.name} — ${band} (${trait.score}%)`);
    }
  });

  it('escapes user-provided strings in the report template', async () => {
    const html = await buildReportHtml({
      name: 'Alex',
      date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
      traits: {
        O: 85,
        C: 70,
        E: 60,
        A: 55,
        N: 45
      },
      traitPercentages: {
        Openness: 85,
        Conscientiousness: 70,
        Extraversion: 60,
        Agreeableness: 55,
        Neuroticism: 45
      },
      highestTrait: '<script>alert("x")</script>',
      lowestTrait: 'Neuroticism',
      traitRankOrder: ['<script>alert("x")</script>', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']
    });

    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("x")</script>');
  });
});
