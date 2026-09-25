# AGENTS.md

## Goals

You are a modern Web/SaaS engineer focused on production-quality code, maintainable architecture,
security by default, mobile first, and fast iteration without over-engineering.

Prefer clarity over cleverness. Prefer proven solutions.

---

## Setup

Before running AI agents for the first time, install the required skills:

```bash
npx skills install
```

Re-run this command whenever new skills are added to the project.

Human contribution setup and verification are documented in
[docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md).

---

## Default Stack

### Core Platform

- Auth: Supabase Auth with Google OAuth (the current product contract is Google-only; other methods require an explicit
  product decision)
- Database: Supabase PostgreSQL (with Prisma ORM)
- Authorization: PostgreSQL RLS
- Backend: Next.js Route Handlers (REST-first)

### Frontend

- Next.js (App Router) + TypeScript
- Tailwind CSS
- UI frameworks and libraries (shadcn/ui by default)
- Forms: React Hook Form + Zod
- Client-only state: Zustand

### Testing

- Unit: Vitest
- E2E: Playwright

Run the configured unit and component tests with `pnpm test`. Add Playwright infrastructure only when an E2E flow requires it. Use Playwright CLI to run E2E tests: `npx playwright test`

---

## Non-Negotiable Rules

### Security

- Client input is untrusted.
- Authorization must live server-side and in RLS.
- Default to deny when unsure.
- Never commit keys, tokens, passwords, private keys, service credentials, provider webhooks, or real
  environment values. Keep them in ignored local environment files or the approved secret store; `.env.example`
  may contain variable names and empty values only.
- Treat public repository history, branches, tags, generated artifacts, screenshots, logs, and pull requests as
  permanent disclosure surfaces. Run the repository secret scan before committing and review the final diff without
  printing secret values.
- If a credential reaches Git or another shared surface, revoke/rotate it with the owning provider immediately,
  remove it from the working tree, and use the approved history-rewrite and remote-cleanup process. Deleting the
  latest copy alone does not remove historical exposure.
- E2E tests must receive local Supabase credentials through `E2E_SUPABASE_*` environment variables; never add
  default JWTs or service-role credentials to test code.

### Validation

- Validate all external input server-side.
- Accept unknown input, validate with Zod.
- Return clear, actionable errors.

---

## API Policy

Default to REST via Next.js Route Handlers. Server Actions are for server-bound UI mutations or flows that do not need an
public HTTP contract; do not expose a Server Action as an accidental public API. Add Route Handlers under
`src/app/api/v{major}/...` when an HTTP endpoint is required.

### API versioning

- Every public API endpoint MUST include an explicit major version in its path: `/api/v1/...`. Never create an unversioned
  alias such as `/api/...` for a public contract.
- The major version changes only for breaking changes: removing or renaming fields, changing field meaning or types,
  changing required inputs, changing authentication/authorization semantics, or changing status/error behavior in a way that
  can break clients.
- Backward-compatible additions—optional request fields, response fields, new resources, and new query filters—remain in the
  current major version. Clients MUST ignore unknown response fields.
- Keep each major version independently understandable and testable. Do not branch behavior throughout a handler with
  scattered version checks; route versions to explicit versioned contracts and services where behavior differs.
- Do not silently change the meaning of an existing field or endpoint. Introduce a new field, endpoint, or major version and
  document the migration.
- When deprecating a version or endpoint, publish the successor, migration notes, and a sunset date. During the migration
  period return `Deprecation` and `Sunset` headers plus a `Link` header with `rel="successor-version"` or `rel="alternate"`.
  Do not remove the old contract before the announced sunset unless there is a documented security or legal requirement.
- Version changes MUST include contract tests and an entry in the changelog or API migration documentation.

### Endpoint and resource design

- Use plural, lowercase, kebab-case resource names: `/api/v1/meal-plans` and `/api/v1/meal-plans/{id}`. Use stable opaque
  identifiers; do not expose database implementation details when a public identifier is available.
- Prefer resource-oriented endpoints for CRUD:
  - `GET /resources`
  - `GET /resources/{id}`
  - `POST /resources`
  - `PATCH /resources/{id}`
  - `PUT /resources/{id}` only when full replacement semantics are intentional
  - `DELETE /resources/{id}`
- Use query parameters for filtering, sorting, field selection, and pagination. Do not create separate read-only paths for
  every filter, such as `/resources/active`; use `/resources?status=active`.
- Use dedicated action endpoints only for a domain command with meaningful side effects or orchestration that is not a simple
  attribute update, such as `/resources/{id}/complete` or `/resources/{id}/sync`.
- Avoid action endpoints for ordinary updates: use `PATCH /resources/{id}` with `{ "owner_id": "..." }`, not
  `/resources/{id}/assign-owner`.
- Avoid duplicate paths for the same behavior. If a legacy path must remain, mark it deprecated and define one canonical
  successor.
- Use `Content-Type: application/json` for JSON requests and return JSON consistently. Reject unsupported media types with
  `415` and unsupported response formats with `406` when content negotiation is implemented.

### HTTP semantics and status codes

- Use HTTP methods and status codes according to their semantics; do not return `200` for every outcome.
- Use `200` for successful reads or updates with a response body, `201` for creation, and `204` for successful operations with
  no response body. Include a `Location` header on `201` responses when the created resource has a canonical URL.
- Use `400` for malformed requests, `401` for missing or invalid authentication, `403` for authenticated callers without
  permission, `404` when the resource is not visible or does not exist, `409` for state or uniqueness conflicts, `412` for
  failed conditional requests, `415` for unsupported media types, `422` for semantically invalid but well-formed input, `429`
  for rate limits, and `500`/`503` for server or dependency failures.
- Preserve idempotency: `GET`, `HEAD`, `PUT`, and `DELETE` MUST be safe to retry according to their semantics. Retry-sensitive
  `POST` operations MUST support an `Idempotency-Key` when duplicate execution could create a material side effect.
- Support conditional updates with `ETag` and `If-Match` when lost updates are possible. Do not overwrite a newer resource
  silently.

### Request validation and response contracts

- Treat `params`, `searchParams`, headers, cookies, request bodies, uploads, and external responses as untrusted `unknown`
  data. Parse them at the Route Handler boundary with Zod before business logic or database access.
- Define separate schemas for path params, query params, request bodies, and response data. Reject invalid input before doing
  side effects. Reject or explicitly account for unknown write fields; never pass raw request objects to Supabase or another
  persistence layer.
- Keep API DTOs separate from database rows. Map and allowlist fields explicitly so internal columns, secrets, audit fields,
  and authorization metadata cannot leak or be mass-assigned.
- Use one predictable success shape per endpoint family. For collections, return `{ "data": [...], "meta": {...}, "links": {...} }`;
  for a single resource, return `{ "data": {...} }`. Do not mix envelopes or return database rows directly.
- Use a stable machine-readable error shape, for example:
  `{ "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [...] , "request_id": "..." } }`.
  Error codes are for clients; messages are safe and actionable. Never expose stack traces, SQL, provider responses, tokens,
  or secrets. Keep sensitive detail in server logs only.
- Document required fields, nullable fields, enum values, limits, examples, and error codes. Public or consumed APIs MUST have
  an OpenAPI contract or an equivalent versioned schema, kept in sync with runtime validation.

### Pagination, filtering, and limits

- Collection endpoints MUST define a deterministic order and bounded page size. Prefer cursor pagination for data that changes
  frequently or can grow large; use offset pagination only when its consistency and limits are acceptable.
- Validate and cap `limit`/`page_size`; never let clients select unrestricted result sizes. Return pagination metadata and links
  that allow clients to continue without reconstructing URLs.
- Allowlist filter and sort fields and validate operators. Do not interpolate client-provided field names, SQL fragments, or
  sort expressions into queries.
- Keep list responses bounded and avoid N+1 database queries. Fetch only fields needed by the response contract.

### Security, authorization, and reliability

- Authenticate and authorize every protected endpoint server-side. Enforce ownership and tenant boundaries in application
  logic and PostgreSQL RLS; default to deny when identity or scope is missing.
- Configure CORS with an explicit allowlist, apply security headers, enforce request-body and upload-size limits, and rate-limit
  public or abuse-prone endpoints. Never use `Access-Control-Allow-Origin: *` for credentialed APIs.
- Keep secrets server-side and out of responses, logs, URLs, and client bundles. Redact authorization headers, cookies, email
  addresses, and other sensitive values from structured logs unless there is an approved operational need.
- Use transactions for multi-write invariants and database constraints for uniqueness, referential integrity, and state rules.
  Do not rely on a read-then-write race-prone check when a constraint or atomic operation can enforce the rule.
- Set explicit timeouts for outbound calls, use bounded retries only for transient and idempotent operations, and return
  controlled `503` responses when a dependency is unavailable. Never retry a non-idempotent operation without an idempotency
  key or equivalent deduplication.
- Emit a request/correlation ID, structured logs, latency and status metrics, and dependency failure metrics. Return the
  request ID in the response error shape so incidents can be traced without exposing internals.

### API testing and compatibility

- Test each endpoint for authentication, authorization/RLS scope, validation failures, success responses, not-found behavior,
  conflict handling, rate limits where applicable, and dependency failures.
- Add contract tests for response schemas and status codes. For every new major version, test representative clients against
  the old and new contracts during the migration period.
- Do not use destructive database migrations or reset shared data in API tests. Use isolated fixtures or explicitly provisioned
  test data and verify that tests cannot target production.

---

## Database & Supabase Patterns

- Include created_at / updated_at timestamps.
- Scope data by user_id where applicable.
- Enable RLS on all user-facing tables.
- Prefer constraints and transactions over app logic.
- Never run Supabase migrations or table updates that may delete existing records.
- Before every migration, explicitly review and verify that it cannot remove records directly or indirectly.
- Destructive or potentially destructive migrations are only allowed with explicit user confirmation or when explicitly requested.
- This prohibition also applies to all test runs (unit, integration, E2E, or any automated test flow): tests must not execute destructive migrations.

---

## Code Quality

- TypeScript strict when possible.
- Avoid any.
- Explain why in comments, not what. Only explain the "why" when it is not obvious from the code itself.

### Naming Conventions

#### File & Directory Names

- Use kebab-case for all frontend file and directory names.
- This applies to components, hooks, utilities, styles, and test files.

| Type             | Example                   |
| ---------------- | ------------------------- |
| Component        | `my-component.tsx`        |
| Hook             | `use-order-summary.ts`    |
| Utility & Helper | `format-currency.ts`      |
| Style module     | `my-component.module.css` |
| Test file        | `my-component.test.tsx`   |
| Directory        | `order-summary/`          |

- Next.js special files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`, etc.)
  follow the framework convention and are **excluded** from this rule.
- Supabase-related files (e.g., `schema.prisma`, `migrations/`) follow their own conventions and are also
  **excluded** from this rule.

#### Exported Identifiers

- React components: `PascalCase` — `MyComponent`
- Hooks: `camelCase` with `use` prefix — `useOrderSummary`
- Utilities and helpers: `camelCase` — `formatCurrency`
- Types and interfaces: `PascalCase` — `OrderSummary`, `UserProfile`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_RETRY_COUNT`

### Barrel Files Policy

Use barrel files when a domain or folder exports more than two public components or utilities.

Rules:

- Create an `index.ts` (or `index.tsx`) at the root of the domain folder.
- Re-export only public-facing modules.
- Do not re-export internal/private helpers.
- Avoid deep import paths when a barrel exists.

Example:

Instead of:
import { PageHeader } from '@/components/app/PageHeader'
import { PageContainer } from '@/components/app/PageContainer'

Use:
import { PageHeader, PageContainer } from '@/components/app'

Guidelines:

- Use barrels to improve DX and readability.
- Do not create barrels for folders with a single export.
- Avoid circular dependencies.
- Keep barrel files flat (no complex logic inside them).

### Styling

Tailwind CSS is the default and only styling mechanism. Before adding any plain CSS (a new class in a `.css` file, a
`.module.css` file, an inline `<style>` block, or a raw `style` object beyond a genuinely dynamic value), first try to
express the same result with Tailwind utility classes — including arbitrary-value utilities (e.g. a one-off pixel
size, an arbitrary breakpoint, or a background image path) and Tailwind's built-in variants (`hover:`,
`focus-visible:`, `before:`/`after:`, `open:`, `group-open:`, `motion-reduce:`, `selection:`). Reach for a design
token (an existing `--color-*`/semantic Tailwind color) before a literal hex value; only fall back to an arbitrary
hex when no token fits.

Never write a literal Tailwind arbitrary-value class (anything with a `[...]`) in a comment, doc, or string that
isn't a real `className` — Tailwind v4 scans the whole repository for class candidates by default, so a placeholder
example (e.g. a literal `url(...)` with no real path) gets compiled into real, broken CSS. Prose describing the
capability, without the bracket syntax itself, is safe.

Only write a custom CSS class when the effect cannot reasonably be expressed as Tailwind utilities on the element —
for example: a multi-layer background composited from several gradients, a `mask`/`-webkit-mask` image, a
`repeating-linear-gradient` texture, or a `@keyframes` animation. When one of these is unavoidable:

- Keep the custom class minimal — only the properties Tailwind cannot express, nothing that a utility class already
  covers.
- Name it for what it does (`.receipt-torn`, `.hero-glow`), never a generic name like `.custom` or `.style1`.
- Add a one-line comment on the rule explaining why it is not a Tailwind utility.
- Do not let a "just this once" custom class become a whole parallel design system (a scoped root with its own
  `--token` variables reimplementing colors Tailwind already provides, a full class-per-component stylesheet). If a
  page needs more than a couple of these exceptions, that is a signal to revisit the approach, not to keep adding
  classes.

Before adding a new custom class, check whether an existing one in `src/app/globals.css` already covers the same
effect (e.g. `hero-mesh`, `scan-line`, `glossy-icon`, `premium-card`) instead of duplicating it.

Delete a custom CSS class as soon as no component references it — an unused rule is dead weight the next person has
to re-verify before trusting the stylesheet.

### Component Reusability

Before writing new TSX or custom component styles, search for a suitable component in this order:

1. Inspect the frontend/UI libraries already used by the project and the primitives already installed under
   `src/components/ui/`.
2. Search the application's existing components, public barrel exports, variants, and composition patterns across
   `components/app/`, `components/commons/`, `components/features/`, and `components/marketing/`.
3. If no installed component fits, use the active library's registry, CLI, or documentation to check for a suitable
   component that can be added through the library's documented workflow.
4. Prefer configuring, composing, or extending an existing component through props and variants over recreating its
   structure or styling with custom markup.
5. Create a new component or custom styles only after confirming that neither the active UI library nor the
   application contains a reasonably similar reusable solution. Place the new implementation in the narrowest
   appropriate scope.

Do not recreate an available library component with a styled `div` or a bespoke primitive. When a suitable library
component exists but is not installed, add it through that library's documented project workflow.

Abstraction threshold: any UI pattern that appears in 2 or more distinct components or pages
must be extracted into a standalone reusable component.

- Where to place shared components:

| Scope | Folder |
| App-wide layout/structural pieces (header, sidebar, page shell, etc.) | `components/app/` |
| Generic, domain-agnostic UI pieces (empty states, badges, avatars, etc.) | `components/commons/` |
| Domain-specific UI tied to a feature | `components/features/<domain>/` |

Rules:

- When a repeated pattern is identified, extract it immediately — do not defer.
- Replace every existing occurrence with the new shared component in the same pass.
- The new component must accept props that cover all current usages; avoid hard-coding values.
- Do not duplicate a component just to make a minor style tweak — use props or variants instead.
- After extraction, verify the barrel file for the target folder is updated (see Barrel Files Policy).
- Prefer composition over inheritance: build complex components from smaller shared ones.

### Component Inspection Identifiers

- Every new application-owned component MUST expose a `data-testid` on its root or primary parent DOM element so it
  can be identified in browser inspection and automated tests. Unchanged third-party UI primitives are exempt.
- The value MUST describe the rendered content or role, not the implementation name. Use `ranked-menu-card`, not
  `card-custom` or `RankedMenuCard`.
- Reusable components MUST accept a `testId` prop when their rendered meaning varies by usage. The caller supplies the
  contextual identifier, such as `profile-preferences-card` or `menu-selection-card`.
- Repeated instances MUST use stable, contextual identifiers that distinguish them when a test needs to target one
  instance. Do not introduce generic hard-coded identifiers such as `card`, `section`, or `component`.
- When adding or changing an application-owned component, update or add the relevant component test to query the
  semantic `data-testid` when the component's parent container is part of the tested behavior. Apply the third-party
  primitive exception in "Testing Expectations" below.

Identification signals (check for these):

- Identical or near-identical TSX blocks across files.
- The same combination of shadcn/ui primitives repeated with only data varying.
- Copy-pasted loading skeletons, empty-state blocks, or page headers.
- Repeated wrapper divs with the same Tailwind class patterns.

### Inline Component Extraction

When a component defined or rendered inside another component grows large or complex, it must be
extracted into its own file.

Extraction triggers (any one is sufficient):

- The inline component exceeds ~40–50 lines of JSX/TSX logic.
- It has its own local state, effects, or event handlers.
- It is conditionally rendered and its logic is non-trivial.
- Keeping it inline makes the parent component hard to read or test.

Placement decision after extraction:

1. Common (`components/commons/`): extract here when the component is generic and
   reusable across multiple domains or features (e.g., a confirmation dialog, a stat card shell,
   a generic list item).
2. Domain/feature (`components/features/<domain>/`): extract here when the component is
   tightly coupled to a specific domain and unlikely to be reused outside it.

Rules:

- Do not leave an extracted component as an unexported function in the same file; always move it
  to its own file.
- After extraction, update the barrel file (`index.ts`) of the target folder accordingly.
- If placement is ambiguous, default to the domain folder and promote to `commons/` only when a
  second distinct use-site appears.

### Custom Hook Extraction

This is not optional: whenever a component's logic — effects, async operations, server requests,
state, or interactions — grows too complex to read inline, it must be extracted into a dedicated
custom hook before the change is considered done.

Extraction triggers (any one is sufficient):

- The component contains 3 or more `useEffect` calls.
- There are 2 or more async operations or server/API calls inline in the component.
- Derived state, loading flags, or error handling spread across several `useState` calls that
  belong to the same concern.
- State and interactions (event handlers, derived values, side effects) have grown large enough
  that the component body is hard to read or test in isolation, even without hitting the
  count-based triggers above.

Placement decision after extraction — always use the `hooks/` folder nearest to the component:

1. Domain/feature module (default): every large component that owns child components is its own
   domain/module and gets a local `hooks/` folder next to it — e.g.
   `components/features/<domain>/hooks/` or, for a nested sub-component with its own children,
   `components/features/<domain>/<sub-component>/hooks/`. Extract there when the hook encapsulates
   logic tightly coupled to that component (e.g., `useProjectMembers`, `useInvoiceActions`,
   `useBillingStatus`). A module can grow the same kind of local, non-`hooks` folders for its other
   concerns as it needs them — `helpers/`, `utilities/`, `tests/`, nested `components/` for its
   children, and so on — following this same nearest-folder rule. In particular, every test file
   belongs in the `tests/` folder of the domain/module it tests (e.g.
   `components/features/<domain>/tests/`), never loose alongside the component files.
2. Common (`src/hooks/`): promote here only once the hook is generic and reused across multiple
   domains or features (e.g., `useDebounce`, `usePagination`, `useMediaQuery`,
   `useOptimisticUpdate`). Do not place a new hook here "just in case" — start it in the domain
   folder and promote it later if reuse actually appears.

Rules:

- Do not duplicate a hook just to handle a minor variation — use parameters or options instead.
- After extraction, update the barrel file (`index.ts`) of the target folder accordingly.
- If placement is ambiguous, default to the nearest domain folder and promote to `src/hooks/` only
  when a second distinct use-site in a different domain appears.

---

## Canonical Project Structure (Default)

> Read this section only when creating new files or directories.

The full structure and rules are defined in [docs/architecture/project-structure.md](docs/architecture/project-structure.md).

---

## Error Handling & UX

- Always show loading states.
- Prevent double submissions.
- Do not leak sensitive data in errors.

---

## Testing Expectations

- Cover critical application-owned logic and behavior.
- Place every component test in the `tests/` folder of its domain/module (see "Custom Hook
  Extraction") instead of loose next to the component file.
- Do not create dedicated tests for unchanged third-party UI-library primitives, including generated or copied
  shadcn/Radix components under `src/components/ui/`. Do not test the library's default rendering, internal DOM,
  keyboard mechanics, or other behavior already owned by that library.
- Test application-owned behavior at the wrapper or consuming-feature boundary. If a local wrapper adds branching,
  state, event handling, an application accessibility contract, or materially changes upstream behavior, cover only
  those additions. A wrapper that only re-exports a primitive or applies presentational classes does not require its
  own test.
- Do not mock Supabase in E2E tests.
- For every modified application-owned component/feature, always run the corresponding test(s) and fix failures
  before finishing.
- If a modified application-owned component/feature has no test yet, create one unless the UI-library exception above
  applies.
- Keep unit tests to the minimum necessary; prefer integration tests and E2E tests whenever feasible.

---

## Tooling & Delegation (Skills + MCP)

The full tooling and delegation policy is defined in [docs/tooling-delegation.md](docs/tooling-delegation.md).

---

## Documentation Ownership

- [docs/README.md](docs/README.md) is the documentation index and topic-ownership map.
- [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) defines the human contribution and verification
  workflow.
- Keep this file authoritative for automated-contributor engineering constraints; link to canonical product,
  architecture, operational, and contribution documents instead of duplicating their requirements.
- Update affected canonical documentation in the same change whenever governed behavior changes.

---

## Working Process

1. Identify impacted areas.
2. Propose minimal viable architecture.
3. Implement end-to-end using the skills available.
4. Run lint, typecheck, tests.
5. Update docs if behavior changes.
