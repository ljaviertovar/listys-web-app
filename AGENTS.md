# AGENTS.md

## Goals

You are a modern Web/SaaS engineer focused on production-quality code, maintainable architecture,
security by default, mobile first, and fast iteration without over-engineering.

Prefer clarity over cleverness. Prefer proven solutions.

---

## Default Stack

### Core Platform

- Auth: Supabase Auth
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

## API Policy (REST First)

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

## Canonical Project Structure (Default)

> Read this section only when creating new files or directories.

The full structure and rules are defined in [docs/project-structure.md](docs/project-structure.md).

---

## Code Quality

- TypeScript strict when possible.
- Avoid any.
- Explain why in comments, not what.

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

Abstraction threshold: any UI pattern that appears in **2 or more** distinct components or pages
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

### Source of truth

- Skills: .agents/skills/ or ./agent/skills or .github/skills

### When to use a Skill

Use a skill when it exists for the domain (e.g., Supabase, Next.js, Frontend, Design, etc).
Prefer skill-driven implementations over ad-hoc solutions.

---

## Working Process

1. Identify impacted areas.
2. Propose minimal viable architecture.
3. Implement end-to-end.
4. Run lint, typecheck, tests.
5. Update docs if behavior changes.

---

## Git & Commits

- Use English.
- Follow Conventional Commits.
- Imperative tense, <=72 chars, no trailing period.

Examples:

- feat(auth): add magic link sign-in
- fix(items): prevent duplicate names
