import { loadEnvConfig } from '@next/env';

const isDev = process.env.NODE_ENV !== 'production';
loadEnvConfig(process.cwd(), isDev);

const run = async () => {
  const { run: generate } = await import('./generate-report-fixtures.impl');
  await generate();
};

run().catch((error) => {
  console.error('Failed to generate report fixtures.');
  console.error(error);
  process.exit(1);
});
