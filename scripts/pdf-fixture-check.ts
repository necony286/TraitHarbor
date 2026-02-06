import assert from 'node:assert/strict';

import { buildReportHtml, traitSectionOrder, type ReportPayload, type ReportTraits } from '../lib/pdf';

const traits: ReportTraits = {
  O: 84,
  C: 68,
  E: 57,
  A: 62,
  N: 46
};

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

const payload: ReportPayload = {
  date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
  traits,
  traitPercentages,
  traitPercentiles: { ...traitPercentages }, // TODO: Replace with actual percentile data. Mirrored for now to enable percentile-dependent UI sections.
  highestTrait: traitRankOrder[0],
  lowestTrait: traitRankOrder[traitRankOrder.length - 1],
  traitRankOrder
};

(async () => {
  try {
    const html = await buildReportHtml(payload);

    const requiredStrings = [
      'How to read this report',
      '30-day action plan',
      '1-week micro-habit',
      'Profile shape:',
      'Resources &amp; methodology',
      'Try this this week'
    ];

    for (const text of requiredStrings) {
      assert.ok(html.includes(text), `Expected report HTML to include "${text}"`);
    }

    assert.ok(!html.includes('Do more of Neuroticism'), 'Expected report HTML to avoid "Do more of Neuroticism"');
    assert.strictEqual(
      html.match(/1-week micro-habit/g)?.length ?? 0,
      1,
      'Expected report HTML to include one 1-week micro-habit heading'
    );
    assert.strictEqual(
      html.match(/<div class="roadmap__block">/g)?.length ?? 0,
      3,
      'Expected report HTML to include three action plan blocks'
    );
    assert.ok(!/{{|}}/.test(html), 'Expected report HTML to have no raw template tokens');

    console.log('PDF fixture check passed.');
  } catch (error) {
    console.error('PDF fixture check failed.');
    console.error(error);
    process.exit(1);
  }
})();
