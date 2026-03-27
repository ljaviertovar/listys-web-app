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

- Auth: Supabase Auth (email magic links + OAuth Google, GitHub)
- Database: Supabase Postgres
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

---

## Non-Negotiable Rules

### Security

- Client input is untrusted.
- Authorization must live server-side and in RLS.
- Default to deny when unsure.

### Validation

- Validate all external input server-side.
- Accept unknown input, validate with Zod.
- Return clear, actionable errors.

---

## API Policy

- Default to REST via Route Handlers.
- Server Actions only when they clearly simplify the flow.
- Use proper HTTP status codes.

### Endpoint Design Rules (Hybrid Semantic REST)

- Prefer resource-oriented endpoints for CRUD:
  - `GET /resources`, `GET /resources/:id`, `POST /resources`, `PATCH /resources/:id`, `DELETE /resources/:id`
- Prefer query params over extra read endpoints for filtered views:
  - Example: use `GET /resources?status=active|archived` instead of creating many read-only variants.
- Use dedicated action endpoints only when behavior is a domain command with side-effects or orchestration:
  - Example: `/resources/:id/complete`, `/resources/:id/retry`, `/resources/:id/sync`
- Avoid action endpoints for simple attribute updates:
  - Example: use `PATCH /resources/:id` with `{ owner_id }`, not `/resources/:id/assign-owner`.
- Avoid duplicate paths for the same behavior:
  - Do not keep both `/resource/:id/cancel` and `DELETE /resource/:id` permanently if they do the same thing.
- If a legacy endpoint must remain temporarily, mark it explicitly as deprecated:
  - Return `Deprecation: true`, `Sunset`, and `Link` headers pointing to the successor endpoint.

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

### Component Reusability

Before writing new TSX, scan the codebase for existing components that already cover the need.
Reuse what exists. Create new shared components only when nothing suitable is present.

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

When a component accumulates significant logic — multiple effects, async operations, or server
requests — that logic must be extracted into a dedicated custom hook.

Extraction triggers (any one is sufficient):

- The component contains 3 or more `useEffect` calls.
- There are 2 or more async operations or server/API calls inline in the component.
- Derived state, loading flags, or error handling spread across several `useState` calls that
  belong to the same concern.
- The logic is complex enough that the component body is hard to read or test in isolation.

Placement decision after extraction:

1. Common (`hooks/`): extract here when the hook is generic and could be reused across
   multiple domains or features (e.g., `useDebounce`, `usePagination`, `useMediaQuery`,
   `useOptimisticUpdate`).
2. Domain/feature (`hooks/<domain>/` or co-located inside `components/features/<domain>/`):
   extract here when the hook encapsulates logic tightly coupled to a specific domain
   (e.g., `useProjectMembers`, `useInvoiceActions`, `useBillingStatus`).

Rules:

- Do not duplicate a hook just to handle a minor variation — use parameters or options instead.
- After extraction, update the barrel file (`index.ts`) of the target folder accordingly.
- If placement is ambiguous, default to the domain folder and promote to `hooks/` only when a
  second distinct use-site in a different domain appears.

---

## Canonical Project Structure (Default)

> Read this section only when creating new files or directories.

The full structure and rules are defined in [docs/project-structure.md](docs/project-structure.md).

---

## Error Handling & UX

- Always show loading states.
- Prevent double submissions.
- Do not leak sensitive data in errors.

---

## Testing Expectations

- Cover critical logic.
- Do not mock Supabase in E2E tests.
- For every modified component/feature, always run the corresponding test(s) and fix failures before finishing.
- If a modified component/feature has no test yet, create one.
- Keep unit tests to the minimum necessary; prefer integration tests and E2E tests whenever feasible.

---

## Tooling & Delegation (Skills + MCP)

The full tooling and delegation policy is defined in [docs/tooling-delegation.md](docs/tooling-delegation.md).

---

## Working Process

1. Identify impacted areas.
2. Propose minimal viable architecture.
3. Implement end-to-end.
4. Run lint, typecheck, tests.
5. Update docs if behavior changes.
