import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  // `vite-tsconfig-paths` is ESM-only, so it must be imported dynamically.
  const { default: tsconfigPaths } = await import('vite-tsconfig-paths');

  return {
    plugins: [tsconfigPaths()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './vitest.setup.ts',
      css: false,
      exclude: ['**/tests/e2e/**', 'node_modules']
    }
  };
});
