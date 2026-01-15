import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  // `@vitejs/plugin-react` and `vite-tsconfig-paths` are ESM-only, so they must be imported dynamically.
  const [{ default: react }, { default: tsconfigPaths }] = await Promise.all([
    import('@vitejs/plugin-react'),
    import('vite-tsconfig-paths')
  ]);

  return {
    plugins: [react(), tsconfigPaths()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './vitest.setup.ts',
      css: false,
      exclude: ['**/tests/e2e/**', 'node_modules']
    }
  };
});
