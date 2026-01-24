import { access, readFile } from 'fs/promises';
import path from 'path';
import type { Browser, Page } from 'puppeteer-core';
import type puppeteer from 'puppeteer-core';

type PuppeteerModule = typeof puppeteer;

const loadPuppeteer = async (): Promise<PuppeteerModule> => {
  // Use a standard dynamic import so Next/Vercel traces puppeteer-core in the server bundle.
  // Browserless provides Chromium remotely, avoiding local Playwright dependencies in production.
  const puppeteerModule = await import('puppeteer-core');
  const resolvedModule =
    (puppeteerModule as { default?: PuppeteerModule }).default ??
    (puppeteerModule as unknown as PuppeteerModule);

  return resolvedModule;
};
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


export type ReportTraits = {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
};

export type ReportPayload = {
  date: Date;
  traits: ReportTraits;
  traitPercentages: Record<string, number>;
  highestTrait: string;
  lowestTrait: string;
  traitRankOrder: string[];
  facetScores?: Record<string, Record<string, number>>;
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

export class LocalBrowserLaunchError extends Error {
  constructor(message = 'Failed to launch local browser.') {
    super(message);
    this.name = 'LocalBrowserLaunchError';
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

const buildOverviewChart = (
  traitScores: Record<typeof traitSectionOrder[number]['scoreKey'], number>
) => {
  const scoresWithNames = traitSectionOrder.map(({ name, scoreKey }) => ({
    name,
    score: clampScore(traitScores[scoreKey])
  }));
  const scoreValues = scoresWithNames.map(({ score }) => score);
  const maxScore = Math.max(...scoreValues);
  const minScore = Math.min(...scoreValues);
  const allScoresEqual = maxScore === minScore;
  const highlightExtremes = !allScoresEqual;

  const rows = scoresWithNames
    .map(({ name, score }) => {
      const classes = ['chart__row'];
      if (highlightExtremes) {
        if (score === maxScore) {
          classes.push('chart__row--hi');
        }
        if (score === minScore) {
          classes.push('chart__row--lo');
        }
      }

      return `        <div class="${classes.join(' ')}">
          <div class="chart__label">${escapeHtml(name)}</div>
          <div class="chart__bar"><span style="width: ${score}%;"></span></div>
          <div class="chart__value">${score}/100</div>
        </div>`;
    })
    .join('\n');

  return {
    html: `      <div class="chart">
${rows}
      </div>`,
    allScoresEqual
  };
};

const buildHighestLowestCallout = (highestTrait: string, lowestTrait: string) => {
  const highest = highestTrait.trim();
  const lowest = lowestTrait.trim();

  if (!highest && !lowest) {
    return '';
  }

  if (highest && lowest) {
    if (highest === lowest) {
      return `      <p class="overview__callout">Highest &amp; Lowest trait: <strong>${escapeHtml(
        highest
      )}</strong>.</p>`;
    }
    return `      <p class="overview__callout">Highest trait: <strong>${escapeHtml(
      highest
    )}</strong>. Lowest trait: <strong>${escapeHtml(lowest)}</strong>.</p>`;
  }

  if (highest) {
    return `      <p class="overview__callout">Highest trait: <strong>${escapeHtml(
      highest
    )}</strong>.</p>`;
  }

  return `      <p class="overview__callout">Lowest trait: <strong>${escapeHtml(
    lowest
  )}</strong>.</p>`;
};

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
const isLocalFallbackEnabled = () => process.env.REPORT_LOCAL_FALLBACK === '1';

const resolveBrowserlessWsUrl = () => {
  const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT?.trim();
  if (!wsEndpoint) {
    throw new BrowserlessConfigError(
      'BROWSERLESS_WS_ENDPOINT is required to generate reports in production.'
    );
  }

  let url: URL;
  try {
    url = new URL(wsEndpoint);
  } catch {
    throw new BrowserlessConfigError(
      'BROWSERLESS_WS_ENDPOINT must be a full ws/wss URL. Provide wss://.../?token=... or use BROWSERLESS_TOKEN.'
    );
  }

  if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
    throw new BrowserlessConfigError(
      `The protocol for BROWSERLESS_WS_ENDPOINT must be ws: or wss:, but got "${url.protocol}".`
    );
  }

  const token = process.env.BROWSERLESS_TOKEN?.trim();
  if (token && !url.searchParams.has('token')) {
    url.searchParams.set('token', token);
  }

  return url.toString();
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

const canUseLocalFallback = async () => {
  if (!isLocalFallbackEnabled() || isVercelRuntime()) {
    return false;
  }

  const executablePath = process.env.CHROME_EXECUTABLE_PATH?.trim();
  if (!executablePath) {
    return false;
  }

  try {
    await access(executablePath);
    return true;
  } catch {
    return false;
  }
};

const connectBrowserless = async (wsUrl: string) => {
  const puppeteer = await loadPuppeteer();
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    return {
      browser,
      cleanup: async () => {
        const browserWithDisconnect = browser as Browser & { disconnect?: () => Promise<void> };
        if (browserWithDisconnect.disconnect) {
          await browserWithDisconnect.disconnect();
        } else {
          await browser.close();
        }
      }
    };
  } catch (error) {
    throw new BrowserlessConnectError(
      error instanceof Error ? error.message : 'Failed to connect to Browserless.'
    );
  }
};

const launchLocalBrowser = async () => {
  const puppeteer = await loadPuppeteer();
  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });
    return {
      browser,
      cleanup: async () => {
        await browser.close();
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to launch local browser.';
    throw new LocalBrowserLaunchError(`Failed to launch local browser: ${message}`);
  }
};

type BrowserHandle = {
  browser: Browser;
  cleanup: () => Promise<void>;
};

export const getBrowser = async (): Promise<BrowserHandle> => {
  logBrowserFactoryState();
  const localFallbackAvailable = await canUseLocalFallback();
  let wsUrl: string;

  try {
    wsUrl = resolveBrowserlessWsUrl();
  } catch (error) {
    if (error instanceof BrowserlessConfigError && localFallbackAvailable) {
      return await launchLocalBrowser();
    }
    throw error;
  }

  try {
    return await connectBrowserless(wsUrl);
  } catch (error) {
    if (localFallbackAvailable) {
      return await launchLocalBrowser();
    }
    throw error;
  }
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

  const highestTrait = payload.highestTrait.trim() || '';
  const lowestTrait = payload.lowestTrait.trim() || '';
  const traitRankOrder = payload.traitRankOrder.filter(Boolean);

  const profileSummary = getProfileSummary(clampedTraitPercentages, traitRankOrder);
  const comparisonText = getComparisonText(traitRankOrder);
  const workStyle = getWorkStyleInsights(clampedTraitPercentages, traitRankOrder);
  const relationshipInsights = getRelationshipInsights(clampedTraitPercentages, traitRankOrder);
  const roadmapBlocks = buildRoadmapBlocks(
    getPersonalDevelopmentRoadmap(clampedTraitPercentages, traitRankOrder)
  );
  const traitRankList = buildListItems(traitRankOrder);
  const { html: overviewChart, allScoresEqual } = buildOverviewChart(scores);
  const fallbackRankedTraits = traitSectionOrder
    .map(({ name, scoreKey }) => ({ name, score: scores[scoreKey] }))
    .sort((a, b) => b.score - a.score);
  const resolvedHighestTrait = highestTrait || fallbackRankedTraits[0]?.name || '';
  const resolvedLowestTrait =
    lowestTrait || fallbackRankedTraits[fallbackRankedTraits.length - 1]?.name || '';
  const highestLowestCallout = allScoresEqual
    ? ''
    : buildHighestLowestCallout(resolvedHighestTrait, resolvedLowestTrait);

  return template
    .replace('{{styles}}', styles)
    .replace('{{trait_sections}}', buildTraitSections(scores, clampedTraitPercentages, payload.facetScores))
    .replace('{{overview_chart}}', overviewChart)
    .replace('{{highest_lowest_callout}}', highestLowestCallout)
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
    const { browser, cleanup } = await getBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      page.setDefaultTimeout(PDF_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PDF_TIMEOUT_MS);
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: PDF_TIMEOUT_MS });
      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate:
          "<div style=\"width:100%;font-size:10px;color:#4b5563;padding:0 24px;\">" +
          "TraitHarbor Premium Report — Page <span class='pageNumber'></span> of <span class='totalPages'></span>" +
          '</div>',
        margin: { top: '24px', bottom: '56px', left: '24px', right: '24px' }
      });

      if (pdf.byteLength > MAX_PDF_BYTES) {
        throw new Error(`PDF too large (${pdf.byteLength} bytes).`);
      }

      return pdf;
    } finally {
      if (page) {
        await page.close();
      }
      await cleanup();
    }
  });
}
