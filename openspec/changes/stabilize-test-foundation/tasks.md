## 1. Establish the validated local environment boundary

- [ ] 1.1 Add a shared immutable E2E environment loader under `e2e/helpers/` for the three required `E2E_SUPABASE_*` inputs and optional local `E2E_APP_URL`; verify pure tests accept the documented loopback configuration and reject missing inputs without consulting ordinary application credentials.
- [ ] 1.2 Validate URL structure, literal loopback hosts, approved ports and redirect destinations before transport/client creation; verify synthetic remote URLs, hostname lookalikes, user-info URLs, unexpected paths and remote redirects trigger zero requests to remote destinations and do not disclose secrets.
- [ ] 1.3 Add explicit Vitest configuration and a package script for `e2e/helpers/tests/`; verify guard tests are discovered, run without Supabase/network access and are excluded from Playwright's browser-test discovery.
- [ ] 1.4 Configure Playwright's dedicated web server with validated E2E-to-app environment mapping, consistent local origins, empty unused provider secrets and no existing-server reuse; verify conflicting application environment values cannot select a remote Supabase target and an occupied application port fails instead of attaching.

## 2. Implement exact fixture ownership and cleanup

- [ ] 2.1 Add per-test-attempt ownership state under `e2e/helpers/` and a test-scoped fixture under `e2e/fixtures/`; verify different workers, test attempts and retries produce distinct identities and reject parent/resource relationships owned by another scope.
- [ ] 2.2 Make seed factories require the validated environment and ownership scope, register successful creations immediately, and generate unique users/passwords; verify pure lifecycle tests retain each recorded resource when a later setup step fails.
- [ ] 2.3 Replace broad reset/account-prefix discovery with exact-ID row/user cleanup and exact recorded Storage-object removal in dependency order; verify unregistered identifiers are rejected before deletion and repeated cleanup handles already absent owned resources.
- [ ] 2.4 Wrap setup/use/teardown in a failure-safe lifecycle, aggregate real cleanup failures and remove the global teardown's swallowed-error behavior; verify induced setup, assertion and cleanup failures remain observable without widening deletion scope.
- [ ] 2.5 Persist a private local ownership manifest under ignored test output for exact recovery after process interruption; verify it contains no keys, passwords, session tokens or signed URLs, rejects mismatched local targets and cannot authorize a prefix or table sweep.

## 3. Migrate every existing E2E caller

- [ ] 3.1 Rework `e2e/fixtures/auth.setup.ts` to expose the real created account and signed-in browser/session, and separate user-context business requests from privileged fixture access; verify returned identity matches the browser and multi-user tests use distinct real local sessions.
- [ ] 3.2 Migrate `e2e/specs/rls-security.spec.ts` and `e2e/specs/shared-lists.spec.ts` to scoped users/data and user-context authorization assertions; verify source inspection finds no unscoped cleanup and each created participant belongs to that test's registry without changing experimental product scope.
- [ ] 3.3 Migrate `e2e/specs/shopping-session.spec.ts`, `e2e/specs/concurrency.spec.ts` and `e2e/specs/ticket-ocr.spec.ts` to scoped fixtures and owned resources; verify no global resets remain and preserve domain assertions for subsequent full-suite reporting.
- [ ] 3.4 Migrate authentication/list UI specs to generated fixture identities and the configured browser origin, registering UI-created accounts and resources; verify there are no fixed shared account dependencies, ordinary app URL fallbacks or unrelated first-record selection.
- [ ] 3.5 Migrate shopping/receipt/landing UI specs to the shared boundary, independent data and owned upload paths; verify no scenario depends on a prior test's state, remove fixture-related sleeps in touched flows, and preserve existing behavioral assertions.
- [ ] 3.6 Harden `e2e/create-test-user.mjs`, helper exports and setup/teardown hooks; verify direct invocation without validated local context fails before side effects, legacy reset flags cannot enable broad deletion and no migration/reset command is invoked by the test lifecycle.

## 4. Prove the isolation contract against local Supabase

- [ ] 4.1 Add `e2e/specs/test-isolation.spec.ts` with a real local Auth/application read-write smoke flow and separately owned synthetic account/row/Storage sentinels; verify one scope's cleanup removes its fixtures while every other scope's sentinel remains readable and unchanged.
- [ ] 4.2 Add passing outer safety checks around induced partial-setup and assertion failures, repeated cleanup and retry identity; verify all resources created before failure are registered for exact cleanup and failure probes do not rely on ignored test failures.
- [ ] 4.3 Review every entry point for the new boundary, confirm an already provisioned local target and run the foundation group using `npx playwright test e2e/specs/test-isolation.spec.ts --workers=2 --repeat-each=5`; verify actual concurrent fixture independence, sentinel preservation and safe teardown before broader suite execution.
- [ ] 4.4 Run the complete suite through `npx playwright test` only after the foundation gate passes; deliver separate harness/product results and evidence for residual domain or provider-prerequisite failures without skipping tests, weakening assertions, applying migrations or contacting the production Supabase environment.

## 5. Document and validate the completed infrastructure change

- [ ] 5.1 Update `e2e/README.md`, root setup guidance, `docs/contributing/CONTRIBUTING.md`, `docs/reference/implementation-status.md` and the changelog with actual environment requirements, local provisioning prerequisites, scoped recovery and verification results; verify internal links resolve and remove the documented E2E blocker only for behavior proven by the new checks.
- [ ] 5.2 Run `pnpm lint`, `pnpm typecheck`, the focused harness Vitest command and `pnpm test:critical`; record actual results and confirm focused helper tests are collected without modifying application behavior or database schemas.
- [ ] 5.3 Review the final implementation diff and file tracking for ignored `e2e/` infrastructure; verify all required files are included, real credentials/manifests/results are excluded, unrelated working-tree edits are preserved and no broad cleanup, remote-target fallback, migration or production deployment was introduced.
