# Architecture Overview

This document contains long-form architectural and platform context for the Listys Web App.

## Product & Platform Summary

Listys is a Next.js + Supabase SaaS app built around a Supabase-first backend model:

- **Auth:** Supabase Auth (email/password, magic link, OAuth)
- **Database:** Supabase Postgres with Row Level Security (RLS)
- **Backend:** Postgres + RLS + Edge Functions
- **Storage:** Supabase Storage (e.g., receipt/ticket images)

Frontend stack:

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for client-only state
- React Hook Form + Zod
- Sonner for notifications
- HugeIcons/Lucide for iconography
- Framer Motion for animations

## Architectural Principles

### Security and integrity

- Keep authorization and data access constraints in RLS.
- Never trust client input for critical operations.
- Route sensitive mutations through Server Actions or API routes.
- Keep Supabase as single source of truth.
- Default permissions to deny.

### Validation and resiliency

- Validate all input with Zod on the server.
- Use centralized config for limits.
- Add array cardinality limits to reduce DoS risk.
- Use case-insensitive duplicate checks where business-critical.
- Maintain loading states for mutations and explicit user feedback.

### Data modeling patterns

- Include `created_at` / `updated_at` timestamps.
- Use `ON DELETE CASCADE` for dependent entities.
- Use `ON DELETE SET NULL` for optional relationships.
- Prefer enum status fields for process lifecycle states.

## REST Endpoint Design Policy

Listys follows a hybrid REST design:

- Use **resource endpoints** (`GET/POST/PATCH/DELETE`) for CRUD operations.
- Use **action endpoints** (`POST /resource/:id/action`) only when an operation represents a domain workflow with side-effects.

### Resource vs Action Endpoints

| Category | Endpoint Pattern | Examples | Why |
|----------|------------------|----------|-----|
| Resource CRUD | `/api/v1/<resource>` + standard verbs | `/api/v1/base-lists/:id` (`PATCH`, `DELETE`), `/api/v1/tickets/:id` (`PATCH`) | Lower maintenance, predictable semantics |
| Filtered reads | Collection query params | `/api/v1/shopping-sessions?status=active|completed` | Avoid one-off read endpoints |
| Domain actions | `/api/v1/<resource>/:id/<action>` (`POST`) | `/api/v1/shopping-sessions/:id/complete`, `/api/v1/tickets/:id/retry-ocr` | Explicit intent + side-effects orchestration |
| Ops/Maintenance actions | `/api/v1/<resource>/maintenance/<action>` | `.../mark-stuck-as-failed`, `.../cleanup-orphaned-images` | Operational jobs are not CRUD |

### Deprecation Policy

- Redundant action endpoints can remain temporarily for compatibility.
- Deprecated routes must return:
  - `Deprecation: true`
  - `Sunset: <RFC-1123 date>`
  - `Link: <successor endpoint>; rel="successor-version"`

## Repository Structure

```text
src/
├── actions/              # Server Actions by domain
├── app/
│   ├── (authenticated)   # Protected routes
│   ├── (marketing)       # Public routes
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── error.tsx         # Root error boundary
│   └── layout.tsx
├── components/
│   ├── app/
│   ├── features/
│   ├── ui/
│   └── commons/
├── data/constants/
├── hooks/
├── lib/
│   ├── config/
│   ├── supabase/
│   ├── validations/
│   └── utils.ts
├── providers/
└── utils/

supabase/
├── config.toml
├── functions/
└── migrations/
```

## MCP Usage Reference

When available, these MCP servers are useful:

- `@modelcontextprotocol/server-supabase` for schema/migrations/RLS/Edge Functions
- `@modelcontextprotocol/server-nextjs` for App Router and Server Action patterns
- `@modelcontextprotocol/server-shadcn` for UI composition guidance
- `@modelcontextprotocol/server-playwright` for E2E patterns

Decision guideline:

- For new features, prefer official framework patterns.
- For existing modules, prioritize consistency with local code.
- In conflicts, evaluate tradeoffs and choose maintainable consistency.
