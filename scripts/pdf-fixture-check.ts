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
  highestTrait: traitRankOrder[0],
  lowestTrait: traitRankOrder[traitRankOrder.length - 1],
  traitRankOrder
};

(async () => {
  try {
    const html = await buildReportHtml(payload);

    const requiredStrings = [
      'Your Personality Profile',
      'Big Five snapshot',
      'Resources + methodology'
    ];

    for (const text of requiredStrings) {
      assert.ok(html.includes(text), `Expected report HTML to include "${text}"`);
    }

    assert.ok(!/{{|}}/.test(html), 'Expected report HTML to have no raw template tokens');

    console.log('PDF fixture check passed.');
  } catch (error) {
    console.error('PDF fixture check failed.');
    console.error(error);
    process.exit(1);
  }
})();
