import { describe, expect, it, vi } from 'vitest';
import { getScoreBandLabel, RESOURCES_BY_TRAIT } from '../lib/report-content';
import { buildReportHtml, traitSectionOrder, type ReportPayload, type ReportTraits } from '../lib/pdf';

vi.mock('../lib/report-content', async (importActual) => {
  const actual = await importActual<typeof import('../lib/report-content')>();

  return {
    ...actual,
    RESOURCES_BY_TRAIT: {
      ...actual.RESOURCES_BY_TRAIT,
      Openness: [
        ...actual.RESOURCES_BY_TRAIT.Openness,
        {
          label: 'Unsafe resource',
          url: 'javascript:alert(1)'
        }
      ]
    }
  };
});

const createReportPayload = (
  traits: ReportTraits,
  overrides: Partial<Omit<ReportPayload, 'traits' | 'traitPercentages'>> = {}
): ReportPayload => {
  const traitPercentages = Object.fromEntries(
    traitSectionOrder.map(({ name, scoreKey }) => [name, traits[scoreKey]])
  );
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
      expect(html).toContain(`${trait.name} — ${band} (${trait.score}/100)`);
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

  it('renders tied callouts when multiple traits share extremes', async () => {
    const traits: ReportTraits = {
      O: 78,
      C: 62,
      E: 62,
      A: 62,
      N: 62
    };

    const html = await buildReportHtml(createReportPayload(traits));

    expect(html).toContain(
      '<p class="overview__callout">Highest trait: <strong>Openness</strong>. Lowest traits: <strong>Conscientiousness</strong>, <strong>Extraversion</strong>, <strong>Agreeableness</strong>, and <strong>Neuroticism</strong> (tied).</p>'
    );
  });

  it('renders a tied highest traits callout when there is a tie for the top score', async () => {
    const traits: ReportTraits = {
      O: 80,
      C: 80,
      E: 60,
      A: 50,
      N: 40
    };

    const html = await buildReportHtml(createReportPayload(traits));

    expect(html).toContain(
      '<p class="overview__callout">Highest traits: <strong>Openness</strong> and <strong>Conscientiousness</strong> (tied). Lowest trait: <strong>Neuroticism</strong>.</p>'
    );
  });

  it('renders the resources section with trait links', async () => {
    const traits: ReportTraits = {
      O: 85,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const html = await buildReportHtml(createReportPayload(traits));
    const [resource] = RESOURCES_BY_TRAIT.Openness;

    expect(html).toContain('<section class="report__resources">');
    expect(html).toContain('<h3>Openness</h3>');
    expect(html).toContain(`href="${resource.url}"`);
    expect(html).toContain(`>${resource.label}</a>`);
  });

  it('filters out unsafe resource links', async () => {
    const traits: ReportTraits = {
      O: 85,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const html = await buildReportHtml(createReportPayload(traits));
    const [resource] = RESOURCES_BY_TRAIT.Openness;

    expect(html).toContain(`href="${resource.url}"`);
    expect(html).not.toContain(unsafeResource.url);
    expect(html).not.toContain(`${unsafeResource.label}</a>`);
  });
});
