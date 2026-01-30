import { readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { buildReportHtml, type ReportPayload } from '../lib/pdf';

const FIXTURE_DIR = path.join(process.cwd(), 'fixtures', 'reports');
const FIXTURE_FILENAME_PATTERN = /^fixture-(\d+)\.payload\.json$/;

const reportPayloadSchema = z.object({
  date: z
    .string()
    .datetime({ message: 'Invalid ISO 8601 date string' })
    .transform((date) => new Date(date)),
  traits: z.object({
    O: z.number(),
    C: z.number(),
    E: z.number(),
    A: z.number(),
    N: z.number()
  }),
  traitPercentages: z.record(z.number()),
  traitPercentiles: z.record(z.number()).optional(),
  highestTrait: z.string(),
  lowestTrait: z.string(),
  traitRankOrder: z.array(z.string()),
  facetScores: z.record(z.record(z.number())).optional()
});

const loadPayload = async (payloadPath: string): Promise<ReportPayload> => {
  const raw = await readFile(payloadPath, 'utf8');
  return reportPayloadSchema.parse(JSON.parse(raw));
};

const writeHtml = async (htmlPath: string, html: string) => {
  await writeFile(htmlPath, html, 'utf8');
};

const run = async () => {
  const files = await readdir(FIXTURE_DIR);
  const fixturePayloads = files.filter((file) => FIXTURE_FILENAME_PATTERN.test(file));

  console.log(`Found ${fixturePayloads.length} fixtures to regenerate.`);

  const tasks = fixturePayloads.map(async (file) => {
    const indexMatch = file.match(FIXTURE_FILENAME_PATTERN);
    if (!indexMatch) {
      throw new Error(
        `Unable to parse fixture index from ${file}. Expected format: fixture-*.payload.json`
      );
    }
    const index = parseInt(indexMatch[1], 10);
    const payloadPath = path.join(FIXTURE_DIR, file);
    const htmlPath = path.join(FIXTURE_DIR, `fixture-${index}.html`);
    const payload = await loadPayload(payloadPath);
    const html = await buildReportHtml(payload);
    await writeHtml(htmlPath, html);
    console.log(`- Regenerated fixture-${index}.html`);
  });

  await Promise.all(tasks);
  console.log('All fixtures regenerated successfully.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
