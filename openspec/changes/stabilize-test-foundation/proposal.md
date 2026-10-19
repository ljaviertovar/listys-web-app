## Why

Listys has real data or active users, as confirmed by the product owner, while the current E2E harness can delete
table-wide data and shares mutable fixtures across parallel tests. Stabilization needs a test boundary that rejects
remote targets and proves cleanup cannot affect data outside the executing test.

## What Changes

- **BREAKING (test configuration only):** require `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY`, and
  `E2E_SUPABASE_SERVICE_ROLE_KEY` for a local Supabase instance; remove fallback to ordinary application credentials
  and the hosted-project/reset-approval configuration.
- Validate the Supabase and browser targets before creating clients, launching the app, seeding, testing or cleaning
  up. Reject remote destinations and redirects that escape the approved local origins.
- Launch a dedicated Next.js process with the validated E2E configuration, without reusing an existing development
  server or inheriting production Supabase targets.
- Replace global resets and email-prefix user deletion with per-test resource ownership and exact-ID cleanup,
  including partial setup, failed tests, retries, multiple users and Storage artifacts.
- Migrate every existing E2E entry point, helper and local test-user utility to the same boundary; generate unique
  fixture accounts and return their actual identities/session data.
- Add focused safety tests and a real-local-Supabase smoke flow proving parallel isolation, sentinel preservation and
  safe teardown. Update test documentation with provisioning prerequisites and remaining application failures.

## Capabilities

### New Capabilities

- `test-isolation`: local-only E2E execution, dedicated application configuration, individually owned fixtures and
  cleanup that remains isolated across concurrent tests, retries and failure paths.

### Modified Capabilities

None. OpenSpec currently has no durable capability specifications. Product APIs, MVP scope and experimental
collaboration requirements are unchanged.

## Impact

- Test infrastructure: `playwright.config.ts`, `e2e/global-setup.ts`, `e2e/global-teardown.ts`, `e2e/helpers/`,
  `e2e/fixtures/auth.setup.ts`, `e2e/specs/`, `e2e/ui/`, and `e2e/create-test-user.mjs`.
- Verification/documentation: focused harness tests/configuration under `e2e/`, test scripts in `package.json`,
  `e2e/README.md`, the root setup guide and the existing canonical contribution/audit documentation.
- Existing Playwright, Vitest and Supabase dependencies are sufficient; no new database tables or runtime services
  are proposed. New infrastructure files must be explicitly tracked because `.gitignore` matches `e2e/`.
- No application-feature changes, production access, schema migrations, database resets, deployments or changes to
  Supabase production configuration. A local database with an independently reviewed schema is a prerequisite;
  this change does not replay potentially destructive historical migrations.
- Session atomicity, OCR reliability, API hardening, broader coverage and service consolidation remain subsequent
  stabilization work. Existing unrelated application failures must be reported rather than hidden or weakened.
