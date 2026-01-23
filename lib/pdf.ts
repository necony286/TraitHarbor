import { readFile } from 'fs/promises';
import path from 'path';
import type { Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import {
  getComparisonText,
  getFacetInsights,
  getGrowthTips,
  getPersonalDevelopmentRoadmap,
  getProfileSummary,
  getRelationshipInsights,
  getScoreBandLabel,
  getStrengths,
  getWorkStyleInsights
} from './report-content';

type PdfMargin = {
  top: string;
  bottom: string;
  left: string;
  right: string;
};

type PdfOptions = {
  format: 'A4';
  printBackground: boolean;
  margin: PdfMargin;
};

export type ReportTraits = {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
};

export type ReportPayload = {
  name: string;
  date: Date;
  traits: ReportTraits;
  traitPercentages: Record<string, number>;
  highestTrait: string;
  lowestTrait: string;
  traitRankOrder: string[];
  facetScores?: Record<string, Record<string, number>>;
  userName?: string;
};

const MAX_PDF_BYTES = 700 * 1024;
const MAX_CONCURRENT_PDF = 2;
const PDF_TIMEOUT_MS = 30_000;

export class PdfRenderConcurrencyError extends Error {
  constructor() {
    super('PDF generation is busy.');
  }
}

export class BrowserlessConfigError extends Error {
  constructor(message = 'Browserless is not configured.') {
    super(message);
    this.name = 'BrowserlessConfigError';
  }
}

export class BrowserlessConnectError extends Error {
  constructor(message = 'Failed to connect to Browserless.') {
    super(message);
    this.name = 'BrowserlessConnectError';
  }
}

const templatePath = (filename: string) => path.join(process.cwd(), 'templates', filename);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

export const traitSectionOrder = [
  { name: 'Openness', token: 'openness', scoreKey: 'O' },
  { name: 'Conscientiousness', token: 'conscientiousness', scoreKey: 'C' },
  { name: 'Extraversion', token: 'extraversion', scoreKey: 'E' },
  { name: 'Agreeableness', token: 'agreeableness', scoreKey: 'A' },
  { name: 'Neuroticism', token: 'neuroticism', scoreKey: 'N' }
] as const;

const buildTraitSections = (
  scores: Record<typeof traitSectionOrder[number]['scoreKey'], number>,
  traitPercentages: Record<string, number>,
  facetScores?: Record<string, Record<string, number>>
) =>
  traitSectionOrder
    .map(
      ({ name, scoreKey }) => {
        const score = scores[scoreKey];
        const strengths = getStrengths(name, score).map(escapeHtml).join(' ');
        const growth = getGrowthTips(name, score).map(escapeHtml).join(' ');
        const facets = getFacetInsights(name, facetScores).map(escapeHtml).join(' ');
        const band = getScoreBandLabel(score);
        const scoreValue = traitPercentages[name] ?? score;

        return `      <section class="report__trait">
        <h2>${name} — ${band} (${scoreValue}%)</h2>
        <h3>How this trait shows up for you</h3>
        <p>${facets || 'Facet insights will appear here when available.'}</p>
        <h3>Strengths to leverage</h3>
        <p>${strengths || 'Identify the strengths that support your goals.'}</p>
        <h3>Growth &amp; balance tips</h3>
        <p>${growth || 'Focus on one growth habit that keeps you balanced.'}</p>
      </section>`;
      }
    )
    .join('\n\n');

const buildListItems = (items: string[]) =>
  items.length ? items.map((item) => `        <li>${escapeHtml(item)}</li>`).join('\n') : '';

const buildRoadmapBlocks = (
  roadmap: Array<{ recommendationType: string; items: string[] }>
) =>
  roadmap
    .map(({ recommendationType, items }) => {
      const scoreItems = items
        .map((item) => `          <li>${escapeHtml(item)}</li>`)
        .join('\n');

      if (!scoreItems) {
        return '';
      }

      return `      <div class="roadmap__block">
        <h3>${escapeHtml(recommendationType)}</h3>
        <ul>
${scoreItems}
        </ul>
      </div>`;
    })
    .filter(Boolean)
    .join('\n');

let activePdfRenders = 0;

const withPdfConcurrencyGuard = async <T>(task: () => Promise<T>) => {
  if (activePdfRenders >= MAX_CONCURRENT_PDF) {
    throw new PdfRenderConcurrencyError();
  }

  activePdfRenders += 1;
  try {
    return await task();
  } finally {
    activePdfRenders = Math.max(0, activePdfRenders - 1);
  }
};

const isVercelRuntime = () => Boolean(process.env.VERCEL);
const isLocalFallbackEnabled = () => process.env.PDF_LOCAL_FALLBACK === '1';

const resolveBrowserlessWsUrl = () => {
  const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT?.trim();
  if (wsEndpoint) {
    try {
      const url = new URL(wsEndpoint);
      if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
        throw new Error('Protocol must be ws: or wss:');
      }
    } catch {
      throw new BrowserlessConfigError(
        'BROWSERLESS_WS_ENDPOINT must be a full ws/wss URL. Provide wss://.../?token=... or use BROWSERLESS_TOKEN.'
      );
    }
    return wsEndpoint;
  }

  const token = process.env.BROWSERLESS_TOKEN?.trim();
  if (token) {
    const host = process.env.BROWSERLESS_HOST?.trim() || 'production-sfo.browserless.io';
    return `wss://${host}/?token=${token}`;
  }

  return null;
};

const logBrowserFactoryState = () => {
  const hasBrowserlessWsEndpoint = Boolean(process.env.BROWSERLESS_WS_ENDPOINT?.trim());
  const hasBrowserlessToken = Boolean(process.env.BROWSERLESS_TOKEN?.trim());
  const localFallbackEnabled = isLocalFallbackEnabled();
  const hasChromeExecutablePath = Boolean(process.env.CHROME_EXECUTABLE_PATH?.trim());

  console.info({
    isVercel: isVercelRuntime(),
    hasBrowserlessWsEndpoint,
    hasBrowserlessToken,
    localFallbackEnabled,
    hasChromeExecutablePath
  });
};

const connectBrowserless = async (wsUrl: string) => {
  try {
    return await puppeteer.connect({ browserWSEndpoint: wsUrl });
  } catch (error) {
    throw new BrowserlessConnectError(
      error instanceof Error ? error.message : 'Failed to connect to Browserless.'
    );
  }
};

const launchLocalBrowser = () =>
  puppeteer.launch({
    executablePath: process.env.CHROME_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });

const getBrowser = async () => {
  logBrowserFactoryState();
  const wsUrl = resolveBrowserlessWsUrl();
  const localFallbackEnabled = isLocalFallbackEnabled();

  if (wsUrl) {
    try {
      return await connectBrowserless(wsUrl);
    } catch (error) {
      if (localFallbackEnabled) {
        return launchLocalBrowser();
      }
      throw error;
    }
  }

  if (!localFallbackEnabled) {
    throw new BrowserlessConfigError(
      'Browserless is not configured. Set BROWSERLESS_WS_ENDPOINT or BROWSERLESS_TOKEN.'
    );
  }

  return launchLocalBrowser();
};

export async function buildReportHtml(payload: ReportPayload) {
  const [template, styles] = await Promise.all([
    readFile(templatePath('report.html'), 'utf8'),
    readFile(templatePath('report.css'), 'utf8')
  ]);

  const clampedTraitPercentages = Object.fromEntries(
    Object.entries(payload.traitPercentages).map(([trait, value]) => [
      trait,
      Number.isFinite(value) ? clampScore(value) : 0
    ])
  );

  const scores = {
    O: clampScore(payload.traits.O),
    C: clampScore(payload.traits.C),
    E: clampScore(payload.traits.E),
    A: clampScore(payload.traits.A),
    N: clampScore(payload.traits.N)
  };

  const normalizedUserName = payload.userName?.trim();
  const narrativeName = normalizedUserName || payload.name || 'You';
  const highestTrait = payload.highestTrait.trim() || '';
  const lowestTrait = payload.lowestTrait.trim() || '';
  const traitRankOrder = payload.traitRankOrder.filter(Boolean);

  const profileSummary = getProfileSummary(clampedTraitPercentages, traitRankOrder, narrativeName);
  const comparisonText = getComparisonText(traitRankOrder, narrativeName);
  const workStyle = getWorkStyleInsights(clampedTraitPercentages, traitRankOrder, narrativeName);
  const relationshipInsights = getRelationshipInsights(clampedTraitPercentages, traitRankOrder, narrativeName);
  const roadmapBlocks = buildRoadmapBlocks(
    getPersonalDevelopmentRoadmap(clampedTraitPercentages, traitRankOrder)
  );
  const traitRankList = buildListItems(traitRankOrder);

  return template
    .replace('{{styles}}', styles)
    .replace('{{trait_sections}}', buildTraitSections(scores, clampedTraitPercentages, payload.facetScores))
    .replaceAll('{{name}}', escapeHtml(payload.name))
    .replaceAll('{{user_name}}', escapeHtml(normalizedUserName || payload.name))
    .replaceAll('{{date}}', escapeHtml(formatDate(payload.date)))
    .replaceAll('{{score_O}}', scores.O.toString())
    .replaceAll('{{score_C}}', scores.C.toString())
    .replaceAll('{{score_E}}', scores.E.toString())
    .replaceAll('{{score_A}}', scores.A.toString())
    .replaceAll('{{score_N}}', scores.N.toString())
    .replaceAll('{{highest_trait}}', escapeHtml(highestTrait))
    .replaceAll('{{lowest_trait}}', escapeHtml(lowestTrait))
    .replaceAll('{{trait_rank_order}}', escapeHtml(traitRankOrder.join(', ')))
    .replaceAll('{{trait_rank_list}}', traitRankList)
    .replaceAll('{{profile_summary}}', escapeHtml(profileSummary))
    .replaceAll('{{comparison_text}}', escapeHtml(comparisonText))
    .replaceAll('{{work_style}}', escapeHtml(workStyle))
    .replaceAll('{{relationship_insights}}', escapeHtml(relationshipInsights))
    .replaceAll('{{roadmap_blocks}}', roadmapBlocks);
}

export async function generateReportPdf(payload: ReportPayload) {
  return withPdfConcurrencyGuard(async () => {
    const html = await buildReportHtml(payload);
    const browser = await getBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      page.setDefaultTimeout(PDF_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PDF_TIMEOUT_MS);
      await page.setContent(html, { waitUntil: 'networkidle', timeout: PDF_TIMEOUT_MS });
      await page.emulateMedia({ media: 'screen' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '24px', bottom: '24px', left: '24px', right: '24px' }
      });

      if (pdf.byteLength > MAX_PDF_BYTES) {
        throw new Error(`PDF too large (${pdf.byteLength} bytes).`);
      }

      return pdf;
    } finally {
      if (page) {
        await page.close();
      }
      await browser.close();
    }
  });
}
