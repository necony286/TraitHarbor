import { describe, expect, it } from 'vitest';
import { getScoreBandLabel } from '../lib/report-content';
import { buildReportHtml, traitSectionOrder, type ReportPayload, type ReportTraits } from '../lib/pdf';

const createReportPayload = (
  traits: ReportTraits,
  overrides: Partial<Omit<ReportPayload, 'traits' | 'traitPercentages'>> = {}
): ReportPayload => {
  const traitPercentages = {
    Openness: traits.O,
    Conscientiousness: traits.C,
    Extraversion: traits.E,
    Agreeableness: traits.A,
    Neuroticism: traits.N
  };
  const traitRankOrder = traitSectionOrder
    .map(({ name, scoreKey }, index) => ({
      name,
      score: traits[scoreKey],
      index
    }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map(({ name }) => name);

  const basePayload: ReportPayload = {
    date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
    traits,
    traitPercentages,
    highestTrait: traitRankOrder[0],
    lowestTrait: traitRankOrder[traitRankOrder.length - 1],
    traitRankOrder
  };

  return {
    ...basePayload,
    ...overrides
  };
};

describe('report template', () => {
  it('hydrates report html with trait scores', async () => {
    const traits: ReportTraits = {
      O: 85,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const html = await buildReportHtml(createReportPayload(traits));

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
    const html = await buildReportHtml(
      createReportPayload(
        {
          O: 85,
          C: 70,
          E: 60,
          A: 55,
          N: 45
        },
        {
          highestTrait: '<script>alert("x")</script>',
          traitRankOrder: [
            '<script>alert("x")</script>',
            'Conscientiousness',
            'Extraversion',
            'Agreeableness',
            'Neuroticism'
          ]
        }
      )
    );

    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("x")</script>');
  });

  it('suppresses the highest/lowest callout when all trait scores are equal', async () => {
    const traits: ReportTraits = {
      O: 50,
      C: 50,
      E: 50,
      A: 50,
      N: 50
    };

    const html = await buildReportHtml(createReportPayload(traits));

    expect(html).not.toContain('<p class="overview__callout">');
  });

  it('renders a combined callout when highest and lowest traits match', async () => {
    const traits: ReportTraits = {
      O: 78,
      C: 62,
      E: 62,
      A: 62,
      N: 62
    };

    const html = await buildReportHtml(
      createReportPayload(traits, {
        highestTrait: 'Openness',
        lowestTrait: 'Openness'
      })
    );

    expect(html).toContain(
      '<p class="overview__callout">Highest &amp; Lowest trait: <strong>Openness</strong>.</p>'
    );
  });
});
