/**
 * Required env vars for local PDF generation:
 * REPORT_LOCAL_FALLBACK=1
 * CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
 */
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { loadQuizItems } from '../lib/ipip';
import {
  buildReportHtml,
  generateReportPdf,
  isLocalFallbackEnabled,
  MAX_CONCURRENT_PDF,
  traitSectionOrder,
  type ReportPayload
} from '../lib/pdf';
import { scoreAnswers, type AnswerMap } from '../lib/scoring';

const FIXTURE_COUNT = 3;
const OUTPUT_DIR = path.join(process.cwd(), 'fixtures', 'reports');

const ensurePdfEnvReady = () => {
  const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT?.trim();
  const localFallbackEnabled = isLocalFallbackEnabled();
  const chromePath = process.env.CHROME_EXECUTABLE_PATH?.trim();

  if (!wsEndpoint && !localFallbackEnabled) {
    console.error(
      'Missing PDF configuration. Set BROWSERLESS_WS_ENDPOINT (and optional BROWSERLESS_TOKEN) for Browserless, or set REPORT_LOCAL_FALLBACK=1 and CHROME_EXECUTABLE_PATH for local rendering.'
    );
    process.exit(1);
  }

  if (localFallbackEnabled && !chromePath) {
    console.error(
      'REPORT_LOCAL_FALLBACK=1 requires CHROME_EXECUTABLE_PATH. Example on Windows: "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe".'
    );
    process.exit(1);
  }
};

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

const computeTraitSummary = (traits: Record<string, number>) => {
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

const writeFixtureFiles = async (index: number, payload: ReportPayload) => {
  const baseName = `fixture-${index}`;
  const payloadPath = path.join(OUTPUT_DIR, `${baseName}.payload.json`);
  const htmlPath = path.join(OUTPUT_DIR, `${baseName}.html`);
  const pdfPath = path.join(OUTPUT_DIR, `${baseName}.pdf`);

  const html = await buildReportHtml(payload);
  const pdf = await generateReportPdf(payload);

  await Promise.all([
    writeFile(payloadPath, JSON.stringify(payload, null, 2), 'utf8'),
    writeFile(htmlPath, html, 'utf8'),
    writeFile(pdfPath, pdf)
  ]);
};

export const run = async () => {
  ensurePdfEnvReady();
  await mkdir(OUTPUT_DIR, { recursive: true });
  const items = ensureFullQuizItems();
  const itemIds = items.map((item) => item.id);
  const generateAndWriteFixture = async (fixtureIndex: number) => {
    const answers = buildRandomAnswers(itemIds);
    const { traits, facetScores } = scoreAnswers(answers, items);
    const { traitPercentages, traitRankOrder, highestTrait, lowestTrait } =
      computeTraitSummary(traits);
    const traitPercentiles = { ...traitPercentages }; // TODO: Replace with actual percentile data. Mirrored for now to enable percentile-dependent UI sections.
    const payload: ReportPayload = {
      date: new Date(),
      traits,
      traitPercentages,
      traitPercentiles,
      traitRankOrder,
      highestTrait,
      lowestTrait,
      facetScores
    };

    await writeFixtureFiles(fixtureIndex, payload);
  };

  const fixtureIndexes = Array.from({ length: FIXTURE_COUNT }, (_, index) => index + 1);

  for (let i = 0; i < fixtureIndexes.length; i += MAX_CONCURRENT_PDF) {
    const chunk = fixtureIndexes.slice(i, i + MAX_CONCURRENT_PDF);
    await Promise.all(chunk.map(generateAndWriteFixture));
  }
};
