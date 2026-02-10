# AGENTS.MD - Working Rules for Listys Web App

## Scope & Priority

- **Scope:** This file applies to the entire repository.
- **Priority order in case of conflict:**
  1. System/developer/user instructions
  2. More specific nested `AGENTS.md` files
  3. This root `AGENTS.md`
- **Critical paths:**
  - `src/actions/**` → Server Actions + validation flow
  - `src/lib/validations/**` and `src/lib/config/**` → validation schemas and limits
  - `supabase/migrations/**` and `supabase/functions/**` → schema, RLS, backend logic
- **Restrictions:**
  - Do not put security logic in frontend-only code.
  - Do not duplicate business logic across frontend and backend.
  - Prefer consistency with existing patterns for modifications.

## Long-form Documentation

Use these docs for descriptive context instead of expanding this file:

- Architecture and platform overview: [`docs/architecture.md`](docs/architecture.md)

## Editing Rules

- Keep changes minimal and focused on the requested task.
- Follow existing naming and folder conventions in the touched domain.
- Use individual imports (avoid barrel exports) when editing TypeScript files.
- Prefer updating existing modules over creating parallel alternatives.

## Code Style

### Import ordering

- Directive first (`'use server'` / `'use client'`)
- External dependencies before internal imports
- No blank lines between import groups

### TypeScript patterns

- Validate Server Action inputs from `unknown` with Zod.
- Use `interface Props` for component props.
- Export `z.infer` types at the end of validation files.
- Keep `any` usage minimal and justified.

### Error handling patterns

- **Server Actions:** avoid try/catch; use early returns with `{ error }`, `{ data }`, or `{ success: true }`.
- **Client Components:** use try/catch/finally for UI state and toast feedback.

### Naming conventions

- Files: `kebab-case`
- Components: `PascalCase`, named exports only
- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Validation Commands

Run relevant checks after edits:

```bash
npm run lint
tsc --noEmit
npm run build
```

Supabase workflows (when applicable):

```bash
npx supabase db push
npx supabase migration new <name>
```

## Security Limits & Data Integrity

- Enforce access through RLS policies; default deny.
- Treat Supabase as source of truth for critical data.
- Validate all inputs server-side with Zod.
- Centralize limits in `src/lib/config/limits.ts`.
- Protect against abuse with array/input size limits.
- Prevent duplicates with case-insensitive checks where needed.

## Commit Conventions

Use Conventional Commits:

```bash
<type>(scope): short description
```

Rules:

- English only
- Imperative present tense
- Subject under 72 characters
- No trailing period
- Specific scope and intent

Typical types: `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`.

## Reporting Changes

When delivering work, include:

1. **Summary** of modified files and behavior.
2. **Validation** commands executed and outcomes.
3. **Risks/Follow-ups** (if any).
4. **Screenshot evidence** for visual UI changes when applicable.
