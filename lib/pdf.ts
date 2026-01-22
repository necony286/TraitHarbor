import { readFile } from 'fs/promises';
import path from 'path';

type SetContentOptions = {
  waitUntil: 'networkidle';
  timeout?: number;
};

type EmulateMediaOptions = {
  media: 'screen';
};

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

type ChromiumPage = {
  setContent: (html: string, options: SetContentOptions) => Promise<void>;
  emulateMedia: (options: EmulateMediaOptions) => Promise<void>;
  pdf: (options: PdfOptions) => Promise<Uint8Array>;
  setDefaultTimeout: (timeout: number) => void;
  setDefaultNavigationTimeout: (timeout: number) => void;
  close: () => Promise<void>;
};

type ChromiumBrowser = {
  newContext: () => Promise<ChromiumContext>;
  close: () => Promise<void>;
};

type ChromiumContext = {
  newPage: () => Promise<ChromiumPage>;
  close: () => Promise<void>;
};

type Chromium = {
  connectOverCDP: (wsEndpoint: string) => Promise<ChromiumBrowser>;
  launch: () => Promise<ChromiumBrowser>;
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
};

const MAX_PDF_BYTES = 700 * 1024;
const MAX_CONCURRENT_PDF = 2;
const PDF_TIMEOUT_MS = 30_000;

export class PdfRenderConcurrencyError extends Error {
  constructor() {
    super('PDF generation is busy.');
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

const traitSectionOrder = [
  { name: 'Openness', token: 'openness', scoreKey: 'O' },
  { name: 'Conscientiousness', token: 'conscientiousness', scoreKey: 'C' },
  { name: 'Extraversion', token: 'extraversion', scoreKey: 'E' },
  { name: 'Agreeableness', token: 'agreeableness', scoreKey: 'A' },
  { name: 'Neuroticism', token: 'neuroticism', scoreKey: 'N' }
] as const;

const buildTraitSections = (scores: Record<typeof traitSectionOrder[number]['scoreKey'], number>) =>
  traitSectionOrder
    .map(
      ({ name, token, scoreKey }) => `      <section class="report__trait">
        <h2>${name} — {{trait_${token}_band}} (${scores[scoreKey]}%)</h2>
        <h3>How this trait shows up for you</h3>
        <p>{{trait_${token}_manifestation}}</p>
        <h3>Strengths to leverage</h3>
        <p>{{trait_${token}_strengths}}</p>
        <h3>Growth &amp; balance tips</h3>
        <p>{{trait_${token}_growth}}</p>
      </section>`
    )
    .join('\n\n');

let chromiumPromise: Promise<Chromium> | undefined;
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

const getChromium = () => {
  if (!chromiumPromise) {
    chromiumPromise = import(/* webpackIgnore: true */ 'playwright-core').then(
      (playwright) => playwright.chromium
    );
  }
  return chromiumPromise;
};

const shouldSkipBrowserless = () =>
  process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === '1';

const isVercelRuntime = () => Boolean(process.env.VERCEL);

const resolveBrowserlessWsUrl = () => {
  const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT?.trim();
  if (wsEndpoint) {
    try {
      const url = new URL(wsEndpoint);
      if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
        throw new Error('Protocol must be ws: or wss:');
      }
    } catch {
      throw new Error(
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

const getBrowser = async () => {
  const chromium = await getChromium();
  const wsUrl = shouldSkipBrowserless() ? null : resolveBrowserlessWsUrl();

  if (wsUrl) {
    return chromium.connectOverCDP(wsUrl);
  }

  if (isVercelRuntime()) {
    throw new Error('Browserless is required on Vercel. Set BROWSERLESS_WS_ENDPOINT or BROWSERLESS_TOKEN.');
  }

  return chromium.launch();
};

export async function buildReportHtml(payload: ReportPayload) {
  const [template, styles] = await Promise.all([
    readFile(templatePath('report.html'), 'utf8'),
    readFile(templatePath('report.css'), 'utf8')
  ]);

  const scores = {
    O: clampScore(payload.traits.O),
    C: clampScore(payload.traits.C),
    E: clampScore(payload.traits.E),
    A: clampScore(payload.traits.A),
    N: clampScore(payload.traits.N)
  };

  return template
    .replace('{{styles}}', styles)
    .replace('{{trait_sections}}', buildTraitSections(scores))
    .replaceAll('{{name}}', escapeHtml(payload.name))
    .replaceAll('{{date}}', escapeHtml(formatDate(payload.date)))
    .replaceAll('{{score_O}}', scores.O.toString())
    .replaceAll('{{score_C}}', scores.C.toString())
    .replaceAll('{{score_E}}', scores.E.toString())
    .replaceAll('{{score_A}}', scores.A.toString())
    .replaceAll('{{score_N}}', scores.N.toString());
}

export async function generateReportPdf(payload: ReportPayload) {
  return withPdfConcurrencyGuard(async () => {
    const html = await buildReportHtml(payload);
    const browser = await getBrowser();
    let context: ChromiumContext | null = null;
    let page: ChromiumPage | null = null;

    try {
      context = await browser.newContext();
      page = await context.newPage();
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
      if (context) {
        await context.close();
      }
      await browser.close();
    }
  });
}
