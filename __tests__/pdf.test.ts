import { describe, expect, it, vi } from 'vitest';
import {
  getFacetInsights,
  getResourcesMethodologyText,
  getScoreBandLabel,
  getTraitMeaning
} from '../lib/report-content';
import { DEFAULT_BALANCE_THRESHOLD, getTraitExtremes } from '../lib/trait-extremes';
import {
  buildReportHtml,
  buildProfileShape,
  escapeHtml,
  traitSectionOrder,
  type ReportPayload,
  type ReportTraits
} from '../lib/pdf';

describe('buildProfileShape', () => {
  it('returns a balanced label when the spread is small', () => {
    const html = buildProfileShape({
      O: 60,
      C: 62,
      E: 65,
      A: 63,
      N: 61
    });

    expect(html).toContain('Profile shape:</strong> Balanced');
  });

  it('returns a mixed label when the spread is moderate', () => {
    const html = buildProfileShape({
      O: 40,
      C: 55,
      E: 50,
      A: 60,
      N: 58
    });

    expect(html).toContain('Profile shape:</strong> Mixed');
  });

  it('returns a peaky label when the spread is large', () => {
    const html = buildProfileShape({
      O: 20,
      C: 75,
      E: 30,
      A: 65,
      N: 80
    });

    expect(html).toContain('Profile shape:</strong> Peaky');
  });

  it('returns an empty string when there are no scores', () => {
    const html = buildProfileShape({} as ReportTraits);

    expect(html).toBe('');
  });
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
      expect(html).toContain(`${trait.name} - ${band} (${trait.score}/100)`);
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

  it('suppresses extreme highlighting in the chart when scores are balanced', async () => {
    const traits: ReportTraits = {
      O: 55,
      C: 52,
      E: 50,
      A: 48,
      N: 49
    };
    const scoresWithNames = traitSectionOrder.map(({ name, scoreKey }) => ({
      name,
      score: traits[scoreKey]
    }));
    const { isBalanced } = getTraitExtremes(scoresWithNames);

    expect(isBalanced).toBe(true);

    const html = await buildReportHtml(createReportPayload(traits));

    expect(html).not.toContain('chart__row chart__row--hi');
    expect(html).not.toContain('chart__row chart__row--lo');
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
      '<p class="overview__callout">Highest: <strong>Openness (78/100)</strong>. Lowest: <strong>Conscientiousness (62/100)</strong>, <strong>Extraversion (62/100)</strong>, <strong>Agreeableness (62/100)</strong>, and <strong>Neuroticism (62/100)</strong> (tied).</p>'
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
      '<p class="overview__callout">Highest: <strong>Openness (80/100)</strong> and <strong>Conscientiousness (80/100)</strong> (tied). Lowest: <strong>Neuroticism (40/100)</strong>.</p>'
    );
  });

  it('renders the resources methodology list', async () => {
    const traits: ReportTraits = {
      O: 85,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const html = await buildReportHtml(createReportPayload(traits));
    const [resource] = getResourcesMethodologyText();

    expect(html).toContain('<section class="report__resources">');
    expect(html).toContain('<ul class="resource-list">');
    expect(html).toContain(resource);
  });

  it('renders facet callouts with the trait meaning when facet scores are provided', async () => {
    const traits: ReportTraits = {
      O: 82,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const facetScores = {
      Openness: {
        imagination: 82,
        adventurousness: 35
      }
    };

    const html = await buildReportHtml(createReportPayload(traits, { facetScores }));
    const meaning = getTraitMeaning('Openness', traits.O);
    const callouts = getFacetInsights('Openness', facetScores);
    for (const callout of callouts) {
      expect(html).toContain(`<li>${escapeHtml(callout)}</li>`);
    }
    expect(html).toContain(`class="trait__meaning">${meaning}</p>`);
  });

  it('renders three action plan blocks without neuroticism phrasing', async () => {
    const traits: ReportTraits = {
      O: 82,
      C: 50,
      E: 45,
      A: 40,
      N: 78
    };
    const html = await buildReportHtml(createReportPayload(traits));

    expect(html).toContain('30-day action plan');
    expect(html).not.toContain('Do more of Neuroticism');
    expect(html).toContain('Stress reset: stress-response sensitivity');
    expect(html.match(/<div class="roadmap__block">/g)?.length ?? 0).toBe(3);
  });

  it('caches template and css file reads across concurrent builds', async () => {
    vi.resetModules();
    const readFile = vi.fn(async (filePath: string) => {
      if (filePath.endsWith('report.css')) {
        return 'body { color: #111; }';
      }

      return '<html><head>{{styles}}</head><body>{{trait_sections}}{{overview_chart}}{{highest_lowest_callout}}{{comparison_section}}</body></html>';
    });

    vi.doMock('fs/promises', async (importOriginal) => {
      const actual = await importOriginal<typeof import('fs/promises')>();

      return {
        ...actual,
        access: vi.fn(),
        readFile,
        default: {
          ...actual,
          access: vi.fn(),
          readFile
        }
      };
    });

    const { buildReportHtml, traitSectionOrder } = await import('../lib/pdf');
    const traits: ReportTraits = {
      O: 60,
      C: 50,
      E: 40,
      A: 30,
      N: 20
    };
    const traitPercentages = Object.fromEntries(
      traitSectionOrder.map(({ name, scoreKey }) => [name, traits[scoreKey]])
    );
    const traitRankOrder = traitSectionOrder.map(({ name }) => name);

    const payload: ReportPayload = {
      date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
      traits,
      traitPercentages,
      highestTrait: traitRankOrder[0],
      lowestTrait: traitRankOrder[traitRankOrder.length - 1],
      traitRankOrder
    };

    await Promise.all([buildReportHtml(payload), buildReportHtml(payload)]);

    const filesRead = readFile.mock.calls.map(([filePath]) => filePath as string);
    expect(filesRead.filter((filePath) => filePath.endsWith('report.html'))).toHaveLength(1);
    expect(filesRead.filter((filePath) => filePath.endsWith('report.css'))).toHaveLength(1);
  });
});
