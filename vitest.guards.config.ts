import { defineConfig } from 'vitest/config'

// The "shadcn-native first" source scan (AGENTS.md). Kept out of the behaviour suite; run with `pnpm check:native-props`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/native-props-guard.test.ts'],
  },
})
