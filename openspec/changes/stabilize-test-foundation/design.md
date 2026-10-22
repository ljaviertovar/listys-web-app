## Context

See [proposal.md](proposal.md) for motivation and [test-isolation](specs/test-isolation/spec.md) for the behavior contract.
The product owner confirmed that the currently used Supabase environment contains real data or active users.

Observed repository constraints:

- [`playwright.config.ts`](../../../playwright.config.ts) loads `.env.test.local` into process state, enables parallel
  execution and can reuse a running development server. Existing UI specs also construct their own base URLs.
- [`global-setup.ts`](../../../e2e/global-setup.ts) expects a hosted-style project reference and a reset-approval flag;
  its URL check does not support the local loopback target described in repository policy.
- [`db-reset.ts`](../../../e2e/helpers/db-reset.ts) deletes rows across domain tables and discovers users by email prefix.
  [`global-teardown.ts`](../../../e2e/global-teardown.ts) calls that cleanup and currently swallows its failure.
- [`supabase-client.ts`](../../../e2e/helpers/supabase-client.ts) reads ordinary application credentials.
  [`seed-data.ts`](../../../e2e/helpers/seed-data.ts) creates users/resources without a per-test ownership ledger.
- [`auth.setup.ts`](../../../e2e/fixtures/auth.setup.ts) obtains identity from browser storage placeholders and exposes
  a shared default password; existing UI specs depend on a pre-existing account or another test's state.
- [`supabase/config.toml`](../../../supabase/config.toml) defines local API port 54321 and Auth site origin
  `http://localhost:3000`. The local database schema must already be provisioned through an independently reviewed
  process; historical migrations are not safe to replay automatically for these tests.
- [`project-structure.md`](../../../docs/architecture/project-structure.md) assigns browser tests to `e2e/` and module
  tests to their nearest `tests/` folder. Existing Vitest discovery only includes `src/**/*.test.ts`.

## Goals / Non-Goals

**Goals:**

- Establish one validated test configuration and one ownership lifecycle used by every E2E entry point.
- Make fixture creation, real-user authentication and exact cleanup independent across workers, retries and failures.
- Prove that the application process and test clients use the same local Supabase configuration.
- Preserve unrelated local sentinel data while keeping test failures and cleanup failures visible.

**Non-Goals:**

- Product schema changes, automatic database provisioning, production queries or deployment.
- Fixing session concurrency/atomicity, OCR processing, API contracts or adding product features.
- Rebuilding all behavioral coverage, introducing a database test framework, or making every existing suite green.
  Repairs to test identity, targeting and fixture ownership are included; unrelated failing assertions remain visible.

## Decisions

### 1. A single immutable configuration boundary

Add environment loading/validation under `e2e/helpers/`, reused by the runner, hooks, factories and manual utility.
Read only the dedicated E2E variables from process input or the ignored `.env.test.local`; never populate missing
E2E credentials from `.env.local` or ordinary application variables. Validate all inputs before creating clients.

The required credential names are `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY` and
`E2E_SUPABASE_SERVICE_ROLE_KEY`. `E2E_APP_URL` defines the local browser origin. Accept only parsed HTTP URLs with
literal loopback hosts (`localhost`, `127.0.0.1`, or `::1`), approved local ports, no embedded credentials, query or
fragment, and no non-root path. Canonicalize `localhost` to a loopback literal for Supabase transport so an arbitrary
hostname alias is never accepted as a local destination. Reject cross-origin redirects before forwarding credentials.

[Assumed: use API port 54321 from the checked-in local configuration and application origin
`http://localhost:3000` by default. A different application port requires an explicit validated local setting and
compatible local Auth configuration; it never permits a remote host.]

Alternative: keep the current project-reference/reset-approval checks. Rejected because they depend on hosted-style
addresses, retain broad cleanup and do not isolate credentials. There is no override flag for remote execution.

### 2. Launch a dedicated application process with explicit E2E values

Build the child environment for Playwright's web server from the validated configuration. Set
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and the
application/site origins consistently from E2E inputs. Do not inherit production Supabase values or provider secrets.
Set unused provider-secret variables explicitly empty in the child environment so Next.js cannot refill them from
ordinary environment files; validate that local E2E overrides win over conflicting `.env.local` values.
Use that same application origin for `baseURL`, server readiness and all existing UI tests. Refuse an occupied port
instead of reusing an existing server; validate both harness requests and browser navigation destinations.

Retain harmless process settings required to run Node/pnpm; passing unrelated environment variables wholesale is not
the credential boundary. Keep PWA development registration disabled for the foundation flow. External OCR provider
checks are not part of the foundation gate and receive no production provider secrets from this launcher.

Alternative: reuse the developer's running app. Rejected because it can hold different project credentials and cached
public configuration. Alternative: change production app clients to detect E2E mode. Rejected because environment
bridging belongs in test infrastructure, with no test switches in product behavior.

### 3. Use test-scoped ownership with unique attempt identities

Create a test-scoped resource fixture in `e2e/fixtures/` backed by a registry under `e2e/helpers/`. Its identity combines
a random run identifier, test identity, worker identity and retry attempt. Record exact user IDs, resource IDs and
Storage bucket/object paths immediately after successful creation. Seed functions require this context explicitly;
unscoped client/seed entry points fail closed.

Use fresh accounts with generated passwords. Support multiple users within one scope for RLS/sharing tests, and
return their actual identities and real local sessions. Use admin access only for setup, inspection and cleanup;
application and RLS assertions execute as the intended user. Track UI-created signup accounts by that test's unique
identity and resolve only that exact account, rather than sweeping Auth users by prefix. Track uploaded objects through
the test's own receipt records/IDs before cleanup. Mutable resources and parent relationships are never shared across
test scopes; multi-user collaboration scenarios belong entirely to one scope.

Alternative: share one account per worker. Rejected for this initial safety change because shopping-session limits,
retries and stateful tests can leak data between tests in that worker. Alternative: serialize everything around global
reset. Rejected because it preserves destructive behavior and prevents proving independent ownership.

### 4. Cleanup uses the recorded graph and runs after partial setup

Start a `try/finally` lifecycle before creating the first resource. Factories record successful creation before the
next dependent operation. Cleanup revalidates the immutable local target and registry membership, removes recorded
Storage objects, then dependent rows and exact recorded Auth user IDs in dependency order. Account cascades are only
used for users explicitly owned by the same test scope; they never discover candidate users from names or prefixes.
Verify that a recorded resource still belongs to that scope before deleting a parent with cascading dependencies.

Treat already absent owned resources as success. Continue independent owned cleanup where safe, aggregate real
failures and fail teardown visibly. Never expand into table-wide or prefix-based cleanup after an error. Global
teardown does not sweep the database or discard cleanup failures. Obsolete reset exports are removed or fail closed
while all callers migrate together.

Keep a local, ignored ownership manifest under `test-results/ownership/` for exact recovery after a killed process.
It contains only validated target metadata and recorded resource identifiers, never keys, passwords, session tokens
or signed URLs. It is not attached automatically to shared reports. Recovery validates the same local target and exact
scope, never scans for similarly named resources. A killed process can leave local fixtures; it cannot justify a sweep.

Alternative: delete all rows for any email beginning with a test prefix. Rejected because existing accounts can match
and concurrent tests use similar names. Alternative: introduce ownership tables/columns. Rejected because the registry
can establish test ownership without database migrations.

### 5. Migrate the entire existing harness without hiding product failures

Update hooks, helpers, fixtures, `e2e/specs/`, `e2e/ui/`, and `e2e/create-test-user.mjs` together. Remove fixed accounts,
fallback browser identities, per-file application URL fallbacks and assumptions that a previous test created data.
Use each fixture's exact IDs and stable current selectors in the flows touched by this migration. Preserve existing
test intent; do not silently exclude experimental tests, soften concurrency assertions, or fix product semantics here.

Manual test-user creation uses the same local validator and creates an explicit owned scope/manifest for cleanup;
it cannot create an unmanaged account against ordinary app credentials. Supabase requests in actual E2E remain real.

Alternative: migrate only the new smoke test and leave old entry points unchanged. Rejected because a maintainer
could still invoke the unsafe runner/helpers directly.

### 6. Verify the foundation separately from the full product suite

Use existing Vitest for pure configuration/ownership checks under the corresponding `e2e/helpers/tests/` module.
Provide an explicit E2E-helper Vitest configuration/discovery command so these tests are actually collected; keep
them out of Playwright discovery and ordinary app-runtime imports. Transport spies for these pure guard tests prove
that rejection makes zero remote calls; actual E2E never replaces Supabase with a mock.

Add a focused `e2e/specs/test-isolation.spec.ts` covering real local Auth, an application read/write, Storage ownership,
two concurrent scopes, retry identities, induced partial setup/assertion failure, repeated cleanup and synthetic
sentinel preservation. Verify sentinels from their separate owner scope before cleaning up that scope itself. Coordinate
concurrency with explicit test state/barriers rather than sleeps. Expected failure probes must be asserted by a passing
outer safety check, not leave the foundation verification intentionally failing.

Run the foundation group with two workers and repeat it five times. Once all entry points are hardened, run the full
suite against the validated local environment and report any unrelated failures separately. No claim about complete
product stability follows from a passing foundation group. Lint/typecheck and existing critical Vitest checks remain
part of implementation validation; no browser appearance changes are planned.

Alternative: require every current E2E assertion to pass in this change. Rejected because known product/constraint
gaps are a different stabilization block. Alternative: mark all failing legacy tests skipped. Rejected because it hides
the uncovered behavior rather than making execution safe.

## Risks / Trade-offs

- [Historical schema is not safely reproducible automatically] -> Require independently reviewed local provisioning;
  missing schema blocks live verification without triggering migration/reset commands.
- [Real Supabase fixtures cost more setup time] -> Start with a small foundation group and retain parallel isolation;
  share immutable configuration, not mutable test accounts.
- [Existing UI specs contain stale selectors or incorrect business expectations] -> Repair only targeting/fixture
  assumptions in this change, preserve domain assertions and record residual failures for later stabilization.
- [Hard termination prevents teardown] -> Retain a private local ownership manifest for exact-ID recovery; no broad sweep.
- [Local credentials or storage paths leak through reports] -> Generate ephemeral credentials, redact diagnostics and
  keep manifests out of committed/shared artifacts. Configuration tests use synthetic values only.
- [Loopback URLs are redirected or names are aliased] -> Validate parsed URLs, canonicalize loopback transport and
  reject destination changes; endpoint safety cannot protect against a deliberately configured malicious local proxy.

## Migration Plan

1. Implement and unit-test fail-closed environment/transport validation before enabling any live E2E run.
2. Replace seed/auth/cleanup entry points and migrate all callers in the same change; remove broad reset paths.
3. Require the dedicated local web server and audit all direct client/URL/manual-utility paths for bypasses.
4. Run pure safety checks, then foundation verification against an already provisioned local instance. Verify sentinel
   preservation, failure cleanup, parallelism and retries before invoking the broader suite.
5. Update test docs, setup/contribution guidance and implementation-status findings based on actual results. Ensure
   new ignored infrastructure files are included in the intended patch without staging unrelated user changes.
6. If the harness cannot enforce the contract, leave E2E execution blocked. Rollback never re-enables broad resets or
   hosted targets. No database migration, data restoration or production deployment is part of this rollout.
