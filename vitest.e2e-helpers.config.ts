import { defineConfig } from 'vitest/config'
import path from 'path'

/** The E2E harness's own guards: pure tests that need no Supabase, no network and no browser. Run with `pnpm test:e2e:helpers`. */
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['e2e/helpers/tests/**/*.test.ts'],
  },
})
