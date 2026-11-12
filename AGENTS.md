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

---

## Default Stack

### Core Platform

- Auth: Supabase Auth with Google OAuth
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

- Unit and component logic: Vitest, using `pnpm test`.
- Browser behavior and E2E: Playwright. Run E2E suites through the CLI with `npx playwright test`; use Playwright CLI
  for interactive behavioral checks.
- Visual validation: Chrome DevTools, using the available browser tools or MCP integration to inspect rendered
  components, capture screenshots and compare the result with the proposed design.

Add Playwright infrastructure only when a browser behavior or E2E flow requires it. See "Testing Expectations" for
visual inspection requirements and the boundary between visual validation and behavioral tests.

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

Default to REST via Next.js Route Handlers under `src/app/api/v{major}/...`; never create an unversioned `/api/...`
alias for a public contract. Server Actions are only for mutations bound to this app's UI that need no public HTTP
contract: they authenticate, authorize and validate like a handler and are never exposed as an accidental public API.

The detailed rules (URL and method design, status codes, DTOs and envelopes, error shape, pagination, idempotency,
versioning and deprecation, rate limiting, API tests) live in the `nextjs-saas-rest-api` skill
(`.agents/skills/nextjs-saas-rest-api/SKILL.md`). Load it only when the task:

- creates, changes, reviews or audits a `route.ts`, a webhook receiver, or a Server Action that saves data;
- changes a request or response shape that clients already consume, or versions or deprecates an endpoint;
- adds the tables, indexes, migrations or RLS that back an API.

Do not load it for UI-only work, styling, copy, documentation, or server logic that has no HTTP or Server Action
boundary.

Baseline that applies whether or not the skill is loaded:

- Authenticate and authorize server-side and in RLS; default to deny.
- Parse every external input (params, query, headers, cookies, bodies, uploads, external responses) with Zod at the
  boundary, before side effects or database access. Never pass raw request objects to Supabase.
- Return explicit fields, not database rows. Errors are actionable and never expose stack traces, SQL, provider
  responses, tokens or secrets.
- Keep it as small as the app needs. Listys stores user-owned data scoped by `user_id` and RLS (experimental sharing
  adds collaborator checks) and has no tenant concept: do not add tenancy, extra layers, caching, idempotency keys or
  rate limits without a concrete need. Reuse the existing helpers in `src/lib/api/` and the services in
  `src/lib/server/services/`; do not run the skill's install or scaffold scripts unless the user approves.
- If the skill and this file disagree, this file wins.

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

#### shadcn-native first

When a project uses shadcn/ui, configure components through their supported props, variants and theme tokens.
For other UI libraries, apply the same principle through the active library's equivalent APIs. Use the project's
actual component locations, styling system and theme configuration; do not assume a framework or directory structure.

- Component appearance — size, shape, colour, typography, borders, rings and shadows — belongs to the component's
  props, variants and theme tokens. Do not override it at call sites with `className` or inline styles. Class-merging
  utilities can make such overrides take precedence over the styles selected by props and silently break their contract.
- Use `className` on library components only for external layout: width constraints, margins, positioning and flex/grid
  placement. Control component height, internal padding, internal gaps and other appearance through the component API.
- When the supported API cannot express a required design, define a reusable variant, size or theme token in the
  project's shared component or theme layer, using the library's documented extension mechanism. Reuse it by name;
  do not distribute appearance overrides or shared styling constants across call sites.
- Wrappers around library components must accept and forward the relevant underlying props to the wrapped component.
  In React, derive those props from the underlying component type where practical. Apply wrapper defaults only when a
  caller omits the prop, so an explicit caller value always takes precedence.
- Prefer the active styling system's standard spacing, sizing and radius scales, and the project's semantic colour
  tokens. Use custom values only when no supported prop, token or utility expresses the requirement, and document the
  reason where the exception is defined.
- The padding and gap of container parts (card header and content, dialog header and footer, sidebar sections, groups of
  options) are appearance too: they come from a `size`, `variant` or `spacing` prop of that part, not from `p-*`, `gap-*` or
  `space-*` at the call site.
- The rule covers every part of a library component, not only the headline control: titles, descriptions, menu items,
  labels, avatars, progress bars, close buttons and compound-component triggers expose sizes, variants or tones too.
  A native element or link that imitates a library component (a hand-styled button, a link with button classes, a
  class-variance helper applied to a link) must use the library component, with the library's "render as child" option
  when the element has to stay a link.
- Exempt by rule: layout (width, margin, position, placement), the shape of a loading placeholder (its size and radius are what it draws) and the glyph size of an icon.
- Where automated checks enforce these rules, derive the set of components and wrappers from the source instead of a
  hand-kept list, follow class names through merge helpers, constants and `*ClassName` props, flag wrappers that drop
  or override the props they receive (an explicit value written after the spread), and keep justified exceptions
  explicit and documented. Do not assume particular test files, component names or allowlist locations.
- Keep shared tokens, base rules and shared utilities in the project's established theme or global style layer.
  Keep feature-specific styles scoped to their feature, following the project's styling conventions.

#### Tailwind and plain CSS

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

Before adding a new custom class, check whether an existing one in `src/app/globals.css` (app-wide: `focus-ring`) or
`src/app/(marketing)/marketing.css` (landing: `scan-line`, `receipt-torn`…) already covers the same effect instead of
duplicating it.

Delete a custom CSS class as soon as no component references it — an unused rule is dead weight the next person has
to re-verify before trusting the stylesheet.

### Design System (source of truth for UI)

Read [docs/contributing/design-system-workflow.md](docs/contributing/design-system-workflow.md) **before** you create
or change a UI component, style, token, theme or styled screen, and when the user asks for a design audit or to
create or update the Design System. Do not load it for logic-only changes, tests, copy edits without styling, or
non-UI code.

Minimum that applies even before you read it:

- Match the Design System; do not invent colors, spacing, radii, type or variants. Express the design through theme
  tokens in `src/app/globals.css` and variants in `src/components/ui/`, per "Styling" above.
- After UI work, run the Design System gate (`/appds:gate <files>`) before reporting the task done, and never present
  the work as DS-aligned if the gate did not run. The file above has the procedure.
- Never edit `docs/design/design-system.html` or `docs/design/audit-findings/`; only the `build-app-design-system`
  skill does.

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
   appropriate scope, and build it from the Design System (see "Design System" above).

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
- Before finishing a change, inspect every new application-owned React component in the diff, including reusable
  layout and presentation helpers, and verify its rendered root has `data-testid`. A component with no rendered DOM
  (such as a provider or listener) is exempt; do not add an artificial wrapper solely to satisfy this rule.
- The value MUST describe the rendered content or role, not the implementation name. Use `ranked-menu-card`, not
  `card-custom` or `RankedMenuCard`.
- Reusable components MUST accept a `testId` prop when their rendered meaning varies by usage. The caller supplies the
  contextual identifier, such as `profile-preferences-card` or `menu-selection-card`. The component forwards it to its root `data-testid`.
- Repeated instances MUST use stable, contextual identifiers that distinguish them when a test needs to target one
  instance. Do not introduce generic hard-coded identifiers such as `card`, `section`, or `component`.
- Tests that need to locate a component (E2E above all) query its semantic `data-testid`. A `data-testid` alone does
  not justify a test: see "Testing Expectations" below for what is tested.

Identification signals (check for these):

- Identical or near-identical TSX blocks across files.
- The same combination of shadcn/ui primitives repeated with only data varying.
- Copy-pasted loading skeletons, empty-state blocks, or page headers.
- Repeated wrapper divs with the same Tailwind class patterns.

### Inline Component Extraction

The default is one component per file, but do not split a parent into atomic files. A file holds one main component
and may keep the child components that only that parent renders, as long as those children are presentational: they
build markup from their props and carry no logic of their own. Separate a child only when the separation pays for
itself.

A child must move to its own file when any of these is true:

- It carries its own logic: more than two `useEffect` calls, a subscription (realtime, polling, listeners), async or
  server calls, or heavy computation.
- Its state and event handlers have grown into a concern of their own (the same signals as in "Custom Hook Extraction";
  extract the hook as well when they apply).
- It is rendered outside its parent's file (see the abstraction threshold above). A shared piece gets its own file, or
  shares one with the pieces it is always rendered with (for example, a set of controls that always appear together, or
  the mobile and desktop variants of the same block).
- Keeping it inline makes the parent hard to read or test, typically when the file grows past ~250 lines.

A child may stay in the parent's file when it is purely visual: a row, a header, an empty or error state, a small
toolbar, a status line. Small local UI state (an open flag, a `useId`) does not by itself justify a new file.

Placement decision after extraction:

1. Common (`components/commons/`): extract here when the component is generic and
   reusable across multiple domains or features (e.g., a confirmation dialog, a stat card shell,
   a generic list item).
2. Domain/feature (`components/features/<domain>/`): extract here when the component is
   tightly coupled to a specific domain and unlikely to be reused outside it.

Rules:

- A child that stays in the parent's file is declared below the parent's props and helpers. Export it only when a test
  or another file of the same module needs it; name its props `<Component>Props` so several components can share
  the file.
- Once a child meets an extraction trigger, move it to its own file; do not leave it as a large unexported function.
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

- Cover critical application-owned logic and behavior. Prefer E2E and integration tests (Route Handlers, server
  actions, services, pages that orchestrate data); write unit tests only for functions, business rules and critical
  processes (validation, permissions, pricing, merging, state transitions, error handling).
- Never test third-party code: no test for an external library added to the project (UI kits, icon sets such as
  `@hugeicons/*`, Radix/shadcn, Zod, Zustand, Supabase clients…) nor for the framework in use (Next.js, React). Test
  only what this repository adds on top of them; mock or stub third-party code at the boundary when a test needs it.
- Do not write tests that assert appearance: Tailwind classes, colours, sizes, spacing, variants, icons, motion
  classes or static copy. Appearance is validated visually (below). A rendered-component test is justified only when
  it checks a behavior or rule — what is shown, hidden, enabled or disabled, ordered or called under a condition.
- Do not duplicate coverage: when a helper's unit test covers a rule, the component or page using it needs at most
  one test proving it is wired in.
- For every component change that affects appearance, start the application locally and use Chrome DevTools to open
  the browser and validate the rendered result against the proposed design (the relevant section of the Design System
  HTML, when applicable). Capture screenshots at the relevant mobile
  and desktop viewports; inspect the live HTML/DOM structure, applied classes, computed styles and element dimensions.
  Check typography, colours, spacing, alignment, sizing, responsive layout and relevant visual states. Fix discrepancies
  and repeat the visual check before finishing. Reading TSX or passing behavioral tests alone does not validate appearance.
- Use Playwright for browser-based user flows, navigation, interactions and behavioral assertions. Use isolated fixtures
  and mock data or network responses where the test scope permits, while preserving the Supabase E2E rule below.
  Test isolated application logic and component behavior with Vitest. Chrome DevTools visual checks complement the
  automated tests; they do not replace them.
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
- If a modified feature changes logic or behavior that no test covers, add one under the rules above. A purely
  presentational change does not need a new test.
- Keep unit tests to the minimum necessary; prefer integration tests and E2E tests whenever feasible.
- The "shadcn-native first" source scan (`src/test/native-props-guard.test.ts`) is a code check, not a behavior test:
  it runs with `pnpm check:native-props` (also in `pre-commit`), outside the default Vitest suite.

---

## Tooling & Delegation (Skills + MCP)

The full tooling and delegation policy is defined in [docs/tooling-delegation.md](docs/tooling-delegation.md).

---

## Documentation Ownership

- [docs/README.md](docs/README.md) is the documentation index and topic-ownership map.
- [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) defines the human contribution and verification
  workflow.
- [docs/design/design-system.html](docs/design/design-system.html) is the only source of truth for UI tokens, components,
  patterns, and visual behavior. Older design documents remain historical references. `docs/design/audit-findings/` is
  managed by the `build-app-design-system` skill (see "Design System").
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
