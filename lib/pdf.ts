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
  getFacetSummary,
  getGrowthTips,
  getPersonalDevelopmentRoadmap,
  getPatternSummary,
  getRelationshipTips,
  getResourcesMethodologyText,
  getScoreBandLabel,
  getStrengths,
  getTraitMeaning,
  getWorkStyleTips,
  RESOURCES_BY_TRAIT
} from './report-content';
import { getTraitExtremes } from './trait-extremes';


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
  traitPercentiles?: Record<string, number>;
  highestTrait: string;
  lowestTrait: string;
  traitRankOrder: string[];
  facetScores?: Record<string, Record<string, number>>;
};

type SectionDefinition = {
  readonly title: string;
  readonly content: string;
  readonly fallback: string;
};

const MAX_PDF_BYTES = 700 * 1024;
const MAX_CONCURRENT_PDF = 2;
const PDF_TIMEOUT_MS = 60_000;
const FONT_LOAD_TIMEOUT_MS = 5_000;
const BROWSERLESS_CONNECT_MAX_ATTEMPTS = 2;
const BROWSERLESS_CONNECT_MIN_BACKOFF_MS = 300;
const BROWSERLESS_CONNECT_MAX_BACKOFF_MS = 800;
let cachedTemplate: Promise<string> | null = null;
let cachedCss: Promise<string> | null = null;

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

const isSafeUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

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

const buildFacetBars = (facets: { facetName: string; score: number }[]) =>
  facets.length
    ? `<div class="facet-grid">
${facets
  .map(
    ({ facetName, score }) => `          <div class="facet-row">
            <span class="facet-label">${escapeHtml(facetName)}</span>
            <div class="facet-bar"><span style="width:${clampScore(score)}%"></span></div>
            <span class="facet-value">${clampScore(score)}/100</span>
          </div>`
  )
  .join('\n')}
        </div>`
    : '';

const buildTraitIntroSection = (
  name: string,
  band: string,
  scoreValue: number,
  meaningContent: string
) => `        <div class="avoid-break">
          <h2>${name} — ${band} (${scoreValue}/100)</h2>
          <h3>What it means for you</h3>
          <p>${meaningContent}</p>
        </div>`;

const buildAvoidBreakSection = (title: string, content: string) => `        <div class="avoid-break">
          <h3>${title}</h3>
          <p>${content}</p>
        </div>`;

const buildTraitSections = (
  scores: Record<typeof traitSectionOrder[number]['scoreKey'], number>,
  traitPercentages: Record<string, number>,
  facetScores?: Record<string, Record<string, number>>
) => {
  return traitSectionOrder
    .map(({ name, scoreKey }) => {
      const score = scores[scoreKey];
      const meaning = getTraitMeaning(name, score);
      const strengths = getStrengths(name, score).map(escapeHtml).join(' ');
      const growth = getGrowthTips(name, score).map(escapeHtml).join(' ');
      const workStyle = getWorkStyleTips(name, score).map(escapeHtml).join(' ');
      const relationships = getRelationshipTips(name, score).map(escapeHtml).join(' ');
      const facetSummary = getFacetSummary(name, facetScores);
      const facetCallouts = facetSummary?.callouts.map(escapeHtml).join(' ') ?? '';
      const band = getScoreBandLabel(score);
      const scoreValue = traitPercentages[name] ?? score;
      const facetBars = facetSummary ? buildFacetBars(facetSummary.facets) : '';
      const sectionDefinitions: SectionDefinition[] = [
        {
          title: 'Strengths',
          content: strengths,
          fallback: 'Identify the strengths that support your goals.'
        },
        {
          title: 'Watch-outs',
          content: growth,
          fallback: 'Focus on one growth habit that keeps you balanced.'
        },
        {
          title: 'Career tip',
          content: workStyle,
          fallback: 'Choose environments that align with how you prefer to work.'
        },
        {
          title: 'Relationship tip',
          content: relationships,
          fallback: 'Notice how this trait shapes how you connect with others.'
        }
      ];
      const meaningContent = facetCallouts || escapeHtml(meaning);
      const sections = [
        buildTraitIntroSection(name, band, scoreValue, meaningContent),
        facetBars ? `<div class="avoid-break">${facetBars}</div>` : '',
        ...sectionDefinitions.map(({ title, content, fallback }) =>
          buildAvoidBreakSection(title, content || fallback)
        )
      ]
        .filter(Boolean)
        .join('\n');

      return `      <section class="report__trait">
${sections}
      </section>`;
    })
    .join('\n\n');
};

const buildListItems = (items: string[]) =>
  items.length ? items.map((item) => `        <li>${escapeHtml(item)}</li>`).join('\n') : '';

const buildResourceGroups = () =>
  traitSectionOrder
    .map(({ name }) => {
      const resources = RESOURCES_BY_TRAIT[name] ?? [];
      const safeResources = resources.filter(({ url }) => isSafeUrl(url));
      if (!safeResources.length) {
        return '';
      }
      const links = safeResources
        .map(
          ({ label, url }) => {
            const escapedUrl = escapeHtml(url);
            return `          <li><a href="${escapedUrl}">${escapeHtml(
              label
            )}</a> — <span class="resource-url">${escapedUrl}</span></li>`;
          }
        )
        .join('\n');
      return `        <div class="resource-group">
          <h3>${escapeHtml(name)}</h3>
          <ul>
${links}
          </ul>
        </div>`;
    })
    .filter(Boolean)
    .join('\n');

const buildOverviewChart = (
  traitScores: Record<typeof traitSectionOrder[number]['scoreKey'], number>
) => {
  const scoresWithNames = traitSectionOrder.map(({ name, scoreKey }) => ({
    name,
    score: clampScore(traitScores[scoreKey])
  }));
  const { highestTraits, lowestTraits, allScoresEqual, isBalanced } =
    getTraitExtremes(scoresWithNames);
  const highlightExtremes = !allScoresEqual && !isBalanced;
  const highestTraitSet = new Set(highestTraits);
  const lowestTraitSet = new Set(lowestTraits);

  const rows = scoresWithNames
    .map(({ name, score }) => {
      const classes = ['chart__row'];
      if (highlightExtremes) {
        if (highestTraitSet.has(name)) {
          classes.push('chart__row--hi');
        }
        if (lowestTraitSet.has(name)) {
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
    allScoresEqual,
    highestTraits,
    lowestTraits,
    isBalanced
  };
};

const listFormatter = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' });

const joinWithAnd = (items: string[]) => listFormatter.format(items);

const buildHighestLowestCallout = ({
  highestTraits,
  lowestTraits,
  isBalanced
}: {
  highestTraits: string[];
  lowestTraits: string[];
  isBalanced: boolean;
}) => {
  const highest = highestTraits.map((trait) => `<strong>${escapeHtml(trait)}</strong>`);
  const lowest = lowestTraits.map((trait) => `<strong>${escapeHtml(trait)}</strong>`);

  if (!highest.length && !lowest.length) {
    return '';
  }

  if (isBalanced) {
    const tied = highest.length > 1 ? ' (tied)' : '';
    const traitList = joinWithAnd(highest);
    return `      <div class="avoid-break">
        <p class="overview__callout">Your scores are fairly balanced overall, with a slight edge in ${traitList}${tied}.</p>
      </div>`;
  }

  const buildStatement = (traits: string[], label: 'Highest' | 'Lowest') => {
    if (!traits.length) {
      return null;
    }
    const traitLabel = `${label} ${traits.length > 1 ? 'traits' : 'trait'}`;
    const tied = traits.length > 1 ? ' (tied)' : '';
    return `${traitLabel}: ${joinWithAnd(traits)}${tied}.`;
  };

  const calloutText = [buildStatement(highest, 'Highest'), buildStatement(lowest, 'Lowest')]
    .filter((statement): statement is string => Boolean(statement))
    .join(' ');

  return `      <div class="avoid-break">
        <p class="overview__callout">${calloutText}</p>
      </div>`;
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

      return `      <div class="avoid-break">
        <div class="roadmap__block">
          <h3>${escapeHtml(recommendationType)}</h3>
          <ul>
${scoreItems}
          </ul>
        </div>
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
  const attemptConnection = async () => {
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
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= BROWSERLESS_CONNECT_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await attemptConnection();
    } catch (error) {
      lastError = error;
      if (attempt < BROWSERLESS_CONNECT_MAX_ATTEMPTS) {
        const backoffRange = BROWSERLESS_CONNECT_MAX_BACKOFF_MS - BROWSERLESS_CONNECT_MIN_BACKOFF_MS;
        const backoffMs =
          BROWSERLESS_CONNECT_MIN_BACKOFF_MS + Math.floor(Math.random() * (backoffRange + 1));
        console.warn(
          `Browserless connect attempt ${attempt} failed. Retrying in ${backoffMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  const message =
    lastError instanceof Error
      ? `Failed to connect to Browserless: ${lastError.message}`
      : 'Failed to connect to Browserless.';
  throw new BrowserlessConnectError(message);
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
  cachedTemplate ||= readFile(templatePath('report.html'), 'utf8');
  cachedCss ||= readFile(templatePath('report.css'), 'utf8');

  const [template, styles] = await Promise.all([cachedTemplate, cachedCss]);

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

  const comparisonText = getComparisonText(traitRankOrder);
  const patternSummary = getPatternSummary(clampedTraitPercentages, traitRankOrder);
  const resourcesMethodology = getResourcesMethodologyText();
  const resourcesByTrait = buildResourceGroups();
  const roadmapBlocks = buildRoadmapBlocks(
    getPersonalDevelopmentRoadmap(clampedTraitPercentages, traitRankOrder)
  );
  const traitRankList = buildListItems(traitRankOrder);
  const { html: overviewChart, allScoresEqual, highestTraits, lowestTraits, isBalanced } = buildOverviewChart(scores);
  const highestLowestCallout = allScoresEqual ? '' : buildHighestLowestCallout({ highestTraits, lowestTraits, isBalanced });
  const hasPercentiles =
    payload.traitPercentiles &&
    Object.values(payload.traitPercentiles).some((value) => Number.isFinite(value));
  const comparisonSection = hasPercentiles
    ? `      <section class="report__comparison">
        <h2>How You Compare to Others</h2>
        <p>${escapeHtml(comparisonText)}</p>
      </section>`
    : '';

  return template
    .replace('{{styles}}', styles)
    .replace('{{trait_sections}}', buildTraitSections(scores, clampedTraitPercentages, payload.facetScores))
    .replace('{{overview_chart}}', overviewChart)
    .replace('{{highest_lowest_callout}}', highestLowestCallout)
    .replace('{{comparison_section}}', comparisonSection)
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
    .replaceAll('{{pattern_summary}}', escapeHtml(patternSummary))
    .replaceAll('{{roadmap_blocks}}', roadmapBlocks)
    .replaceAll('{{resources_methodology}}', escapeHtml(resourcesMethodology))
    .replaceAll('{{resources_by_trait}}', resourcesByTrait);
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
      await page.setContent(html, { waitUntil: 'load', timeout: PDF_TIMEOUT_MS });
      await page.emulateMediaType('print');
      try {
        await page.evaluate(async (fontLoadTimeoutMs) => {
          if ('fonts' in document && document.fonts?.ready) {
            await Promise.race([
              document.fonts.ready,
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error('Timed out waiting for fonts to load.')),
                  fontLoadTimeoutMs
                )
              )
            ]);
          }
        }, FONT_LOAD_TIMEOUT_MS);
      } catch (error) {
        // Ignore font readiness failures so PDF generation can continue, but log the error for debugging.
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('Failed to wait for font readiness.', errorMessage);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate:
          `<div style="width: 100%; font-size: 10px; color: #4b5563; padding: 0 24px; text-align: right;">` +
          `TraitHarbor Premium Report — Page <span class='pageNumber'></span> of <span class='totalPages'></span>` +
          `</div>`,
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
