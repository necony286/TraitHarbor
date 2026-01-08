import { readFile } from 'fs/promises';
import path from 'path';
import type { Chromium } from 'playwright';

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

let chromiumPromise: Promise<Chromium> | undefined;

const getChromium = () => {
  if (!chromiumPromise) {
    chromiumPromise = import(/* webpackIgnore: true */ 'playwright').then(
      (playwright) => playwright.chromium
    );
  }
  return chromiumPromise;
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
    .replaceAll('{{name}}', escapeHtml(payload.name))
    .replaceAll('{{date}}', escapeHtml(formatDate(payload.date)))
    .replaceAll('{{score_O}}', scores.O.toString())
    .replaceAll('{{score_C}}', scores.C.toString())
    .replaceAll('{{score_E}}', scores.E.toString())
    .replaceAll('{{score_A}}', scores.A.toString())
    .replaceAll('{{score_N}}', scores.N.toString());
}

export async function generateReportPdf(payload: ReportPayload) {
  const html = await buildReportHtml(payload);
  const chromium = await getChromium();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
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
    await browser.close();
  }
}
