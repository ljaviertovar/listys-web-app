# AGENTS.md — Project Instructions for AI Coding Agents

These instructions apply to any AI agent working in this repository (GitHub Copilot, Claude, Antigravity, Codex, etc.).
If project-specific instructions exist elsewhere, follow them as additions unless they contradict this file.

---

## 1) Goals

You are a modern Web/SaaS engineer focused on production-quality code, maintainable architecture,
security by default, and fast iteration without over-engineering.

Prefer clarity over cleverness. Prefer proven solutions.

---

## 2) Default Stack (Sensible Defaults)

Unless explicitly stated otherwise:

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

- Unit: Jest or Vitest (follow existing repo)
- E2E: Playwright (recommended)

---

## 3) Non-Negotiable Rules

### Security

- Client input is untrusted.
- Authorization must live server-side and in RLS.
- Default to deny when unsure.

### Validation

- Validate all external input server-side.
- Accept unknown input, validate with Zod.
- Return clear, actionable errors.

---

## 4) API Policy (REST First)

- Default to REST via Route Handlers.
- Server Actions only when they clearly simplify the flow.
- Use proper HTTP status codes.

---

## 5) Database & Supabase Patterns

- Include created_at / updated_at timestamps.
- Scope data by user_id where applicable.
- Enable RLS on all user-facing tables.
- Prefer constraints and transactions over app logic.

---

## 6) Canonical Project Structure (Default)

Use this structure unless explicitly instructed otherwise. If the repository already has a different convention,
follow the existing convention and map new code into it.

```bash
├── public
├── src
│   ├── actions/                  # Server Actions (CRUD by domain) — only if the repo uses them
│   ├── app/
│   │   ├── (authenticated)       # Protected routes
│   │   ├── (marketing)           # Public landing pages
│   │   ├── api/                  # API routes
│   │   ├── auth/
│   │   │   ├── callback/         # OAuth callback
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── error.tsx             # Root error boundary
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── app/                  # App-specific components (header, footer, aside, menus, sidebar, dashboard, etc.)
│   │   ├── features/             # Feature-specific components by domain
│   │   ├── ui/                   # shared UI components (shadcn/ui if present)
│   │   └── commons/              # Shared components (logo, etc.)
│   ├── data/
│   │   └── constants/            # App constants
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── config/               # Configurable configs and settings (limits, feature flags, etc.)
│   │   ├── supabase/             # Supabase clients (server, client, admin)
│   │   ├── validations/          # Zod schemas by domain
│   │   └── utils.ts              # Utilities (cn, etc.)
│   ├── providers/                # React context providers
│   ├── stores/                   # Zustand stores by domain
│   └── utils/                    # Helper functions (formatters, etc.)
├── supabase/
│   ├── config.toml
│   ├── functions/                # Edge Functions (only if used)
│   └── migrations/               # SQL migrations (timestamped)
└── README.md
```

Structure rules:

- Keep domains cohesive: group code by feature/domain when possible.
- Shared code must be truly shared (avoid dumping feature code in shared folders).
- Prefer adding new code next to related code instead of creating new top-level buckets.

---

## 7) Code Quality

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

---

## 8) Error Handling & UX

- Always show loading states.
- Prevent double submissions.
- Do not leak sensitive data in errors.

---

## 9) Testing Expectations

- Cover critical logic.
- Do not mock Supabase in E2E tests.

---

## 10) Tooling & Delegation (Skills + MCP)

### Source of truth

- Skills: .agents/skills/ or ./agent/skills or .github/skills

### When to use a Skill

Use a skill when it exists for the domain (e.g., Supabase, Next.js, Frontend, Design, etc).
Prefer skill-driven implementations over ad-hoc solutions.

---

## 11) Working Process

1. Identify impacted areas.
2. Propose minimal viable architecture.
3. Implement end-to-end.
4. Run lint, typecheck, tests.
5. Update docs if behavior changes.

---

## 12) Git & Commits

- Use English.
- Follow Conventional Commits.
- Imperative tense, <=72 chars, no trailing period.

Examples:

- feat(auth): add magic link sign-in
- fix(items): prevent duplicate names

---

## 13) Conflict Resolution

- Prefer existing repo conventions.
- Security rules override convenience.

---

## 14) What Not To Do

- Do not add new frameworks by default.
- Do not bypass RLS.
- Do not invent abstractions without clear benefit.
