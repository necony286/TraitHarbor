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
  const files = await readdir(FIXTURE_DIR);
  const fixturePayloads = files.filter((file) =>
    /^fixture-\d+\.payload\.json$/.test(file)
  );

  console.log(`Found ${fixturePayloads.length} fixtures to regenerate.`);

  const tasks = fixturePayloads.map(async (file) => {
    const index = parseInt(file.match(/(\d+)/)[1], 10);
    const payload = await loadPayload(index);
    const html = await buildReportHtml(payload);
    await writeHtml(index, html);
    console.log(`- Regenerated fixture-${index}.html`);
  });

  await Promise.all(tasks);
  console.log('All fixtures regenerated successfully.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
