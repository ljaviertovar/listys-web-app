# Contributing

Use the [root setup guide](../../README.md) for development. [PRD v2](../prd/PRD-v2.md) governs the MVP; collaboration
is experimental. [AGENTS.md](../../AGENTS.md) owns engineering constraints and the
[project structure](../architecture/project-structure.md) owns placement rules. For visual work, use the canonical
[Design system v2 HTML](../design/listys-design-system.html) with its [written specification](../design/DESIGN.md).

## Verification before a PR

```bash
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm check:native-props
pnpm verify:limits-reference
pnpm build
```

`pnpm test` starts Vitest watch mode. `pnpm test:critical` covers actions, API routes, lib, stores and utilities.
Vitest uses the Node environment and includes `src/**/*.test.ts`; component-named tests do not establish rendered
browser coverage. Inspect their assertions before claiming UI validation. `pnpm check:native-props` runs the
"shadcn-native first" source scan, which is kept out of the default suite.

Run corresponding tests for modified features and add missing application-owned behavior coverage under AGENTS.md.
Third-party code (external libraries and the framework) is never tested, and appearance (classes, colours, sizes,
icons, static copy) is not asserted in tests. Appearance changes also require local Chrome DevTools
inspection and mobile/desktop screenshots against the relevant sections of the Design system v2 HTML. Documentation-only
changes need link, evidence, terminology, command and diff checks; they do not require a new browser test.

## Playwright boundary

The intended suite entry point is `npx playwright test` (also `pnpm test:e2e`), with interactive checks through
Playwright CLI. The tracked configuration loads `.env.test.local`, uses Chromium, and starts its own `next dev` on the port of `E2E_APP_URL` against the loopback `E2E_SUPABASE_*` inputs; it never reuses a running server. The harness guards run with `pnpm test:e2e:helpers`.

**Current execution blocker:** no browser spec has run on a provisioned local Supabase. E2E inputs are the loopback-only `E2E_SUPABASE_*` variables (see [e2e/README.md](../../e2e/README.md)); global teardown no longer wipes data, but the legacy specs still use table-wide reset helpers behind a loopback guard until their fixtures are migrated.
Credentials now come only from the loopback `E2E_SUPABASE_*` inputs, but the legacy specs still use table-wide reset helpers behind that guard. Do not run the suite as routine verification until cleanup is fixture-scoped (`openspec/changes/stabilize-test-foundation`). Never reset shared data, target production, embed
default credentials, mock Supabase in E2E or run destructive migrations through tests. See the
[audit finding](../reference/implementation-status.md#audit-findings-and-follow-up).

Existing tracked `e2e/` and `scripts/` files remain versioned although `.gitignore` matches those folders. Check tracking
explicitly when adding infrastructure: new files there may be silently ignored.

## Git and review

- Use `feat/`, `fix/`, `chore/` or `hotfix/` branches and Conventional Commit PR titles.
- Describe the problem, resulting behavior, verification and limitations. Link an issue when one exists.
- `pre-commit` invokes lint-staged then the critical suite; `pre-push` invokes typecheck. Local hooks are not proof of CI.
  No tracked `.github/workflows` pipeline was found in this audit.
- Follow the repository secret-scan requirement before committing. No dedicated scanner command/configuration was
  found; identify the approved scanner instead of claiming that check passed. Never print secret values.
- Update the canonical documentation owner in the same change; see the [index](../README.md).

Bug reports need reproduction steps, expected/actual behavior, environment and redacted evidence. Keep real receipts,
signed image URLs, invite tokens, cookies and credentials out of public issues.
