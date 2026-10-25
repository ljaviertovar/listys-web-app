import { configDefaults, defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: [
      // The package entry re-exports ~4,700 icon files, and every test file that renders a component loaded them one by one
      // (the suite took ~11 minutes). Its single-file bundle exports the same icons.
      {
        find: /^@hugeicons\/core-free-icons$/,
        replacement: path.resolve(__dirname, './node_modules/@hugeicons/core-free-icons/dist/esm/index.min.js'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    // A source scan, not a behaviour test: it runs through `pnpm check:native-props` (vitest.guards.config.ts).
    exclude: [...configDefaults.exclude, 'src/test/native-props-guard.test.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/**/types.ts'],
    },
  },
})
