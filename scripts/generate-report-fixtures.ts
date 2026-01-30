/**
 * Required env vars for local PDF generation:
 * REPORT_LOCAL_FALLBACK=1
 * CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
 */
import { loadEnvConfig } from '@next/env';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { loadQuizItems } from '../lib/ipip';
import { scoreAnswers, type AnswerMap } from '../lib/scoring';

import type { ReportPayload } from '../lib/pdf';

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');

const FIXTURE_COUNT = 3;
const OUTPUT_DIR = path.join(process.cwd(), 'fixtures', 'reports');

const ensureFullQuizItems = () => {
  const previousFixtureMode = process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE;
  try {
    if (previousFixtureMode !== undefined) {
      delete process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE;
    }
    return loadQuizItems();
  } finally {
    if (previousFixtureMode !== undefined) {
      process.env.NEXT_PUBLIC_QUIZ_FIXTURE_MODE = previousFixtureMode;
    }
  }
};

const buildRandomAnswers = (itemIds: string[]): AnswerMap =>
  Object.fromEntries(itemIds.map((id) => [id, Math.floor(Math.random() * 5) + 1]));

const computeTraitSummary = (
  traits: Record<string, number>,
  traitSectionOrder: { name: string; scoreKey: string }[]
) => {
  const traitPercentages = Object.fromEntries(
    traitSectionOrder.map(({ name, scoreKey }) => [name, traits[scoreKey]])
  );
  const traitRankOrder = traitSectionOrder
    .map(({ name, scoreKey }, index) => ({
      name,
      score: traits[scoreKey],
      index
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ name }) => name);

  return {
    traitPercentages,
    traitRankOrder,
    highestTrait: traitRankOrder[0],
    lowestTrait: traitRankOrder[traitRankOrder.length - 1]
  };
};

const writeFixtureFiles = async (
  index: number,
  payload: ReportPayload,
  options: {
    buildReportHtml: (payload: ReportPayload) => Promise<string>;
    generateReportPdf: (payload: ReportPayload) => Promise<Buffer>;
  }
) => {
  const baseName = `fixture-${index}`;
  const payloadPath = path.join(OUTPUT_DIR, `${baseName}.payload.json`);
  const htmlPath = path.join(OUTPUT_DIR, `${baseName}.html`);
  const pdfPath = path.join(OUTPUT_DIR, `${baseName}.pdf`);

  const html = await options.buildReportHtml(payload);
  const pdf = await options.generateReportPdf(payload);

  await writeFile(payloadPath, JSON.stringify(payload, null, 2), 'utf8');
  await writeFile(htmlPath, html, 'utf8');
  await writeFile(pdfPath, pdf);
};

const run = async () => {
  const { buildReportHtml, generateReportPdf, traitSectionOrder } = await import('../lib/pdf');
  await mkdir(OUTPUT_DIR, { recursive: true });
  const items = ensureFullQuizItems();
  const itemIds = items.map((item) => item.id);

  for (let index = 1; index <= FIXTURE_COUNT; index += 1) {
    const answers = buildRandomAnswers(itemIds);
    const { traits, facetScores } = scoreAnswers(answers, items);
    const { traitPercentages, traitRankOrder, highestTrait, lowestTrait } =
      computeTraitSummary(traits, traitSectionOrder);
    const payload: ReportPayload = {
      date: new Date(),
      traits,
      traitPercentages,
      traitRankOrder,
      highestTrait,
      lowestTrait,
      facetScores
    };

    await writeFixtureFiles(index, payload, { buildReportHtml, generateReportPdf });
  }
};

run().catch((error) => {
  console.error('Failed to generate report fixtures.');
  console.error(error);
  process.exit(1);
});
