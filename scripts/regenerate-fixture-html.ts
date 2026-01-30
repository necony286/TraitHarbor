import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildReportHtml, type ReportPayload } from '../lib/pdf';

const FIXTURE_DIR = path.join(process.cwd(), 'fixtures', 'reports');
const FIXTURE_COUNT = 3;

const loadPayload = async (index: number): Promise<ReportPayload> => {
  const payloadPath = path.join(FIXTURE_DIR, `fixture-${index}.payload.json`);
  const raw = await readFile(payloadPath, 'utf8');
  const payload = JSON.parse(raw) as ReportPayload;

  return {
    ...payload,
    date: new Date(payload.date)
  };
};

const writeHtml = async (index: number, html: string) => {
  const htmlPath = path.join(FIXTURE_DIR, `fixture-${index}.html`);
  await writeFile(htmlPath, html, 'utf8');
};

const run = async () => {
  for (let index = 1; index <= FIXTURE_COUNT; index += 1) {
    const payload = await loadPayload(index);
    const html = await buildReportHtml(payload);
    await writeHtml(index, html);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
