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

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Type Checking

```bash
tsc --noEmit         # Run TypeScript type checking (no script in package.json)
```

### Supabase

```bash
npx supabase init                    # Initialize Supabase project
npx supabase start                   # Start local Supabase
npx supabase db push                 # Push migrations to database
npx supabase migration new <name>    # Create new migration
npx supabase functions deploy        # Deploy Edge Functions
```

### Testing

⚠️ **Not configured yet** - Jest and Playwright are in the tech stack but not currently set up.

---

## 2. Model Context Protocol (MCP) Servers

When working with this codebase, utilize these MCP servers for specialized context:

### Available MCPs

1. **@modelcontextprotocol/server-supabase**
   - Use for: Database schema, RLS policies, migrations, Edge Functions
   - When: Creating tables, writing RLS policies, querying database structure

2. **@modelcontextprotocol/server-nextjs**
   - Use for: App Router patterns, Server Components, Server Actions, caching
   - When: Creating pages/layouts, implementing server actions, revalidation

3. **@modelcontextprotocol/server-shadcn**
   - Use for: UI component usage, variants, composition patterns
   - When: Adding UI components, customizing shadcn components, accessibility

4. **@modelcontextprotocol/server-playwright**
   - Use for: E2E test patterns, selectors, authentication flows
   - When: Writing E2E tests, testing auth flows, verifying user journeys

### MCP Query Checklist

Before implementing features, consult MCPs for:

- [ ] Query MCP for framework-specific patterns before implementing
- [ ] Validate API usage and function signatures against official docs
- [ ] Check official patterns for complex features
- [ ] Verify test strategies with Playwright MCP

### Priority Rule: Balance MCP vs Codebase

- **For new features**: Follow MCP patterns and official recommendations
- **For modifications**: Maintain existing codebase consistency
- **For conflicts**: Evaluate case-by-case, prioritize internal consistency
- **Default**: When in doubt, prefer consistency with existing code patterns

---

## 3. Architectural Principles

### Supabase-First Architecture

**Core Platform:**

- **Auth** → Supabase Auth (email/password, magic link, OAuth)
- **Database** → Supabase Postgres with Row Level Security (RLS)
- **Backend** → Supabase (Postgres + RLS + Edge Functions)
- **Storage** → Supabase Storage (receipt images)

**Frontend Stack:**

- **Framework** → Next.js 16.1+ (App Router) + TypeScript
- **UI** → Tailwind CSS 4 + shadcn/ui
- **State Management** → Zustand (client-only state)
- **Forms & Validation** → React Hook Form + Zod
- **Notifications** → Sonner (toast notifications)
- **Icons** → HugeIcons React + Lucide React
- **Animations** → Framer Motion

### Golden Rules (Non-Negotiable)

**Security & Data Integrity:**

- All security lives in **RLS policies**, never in the frontend
- The frontend **never trusts critical client data**
- Sensitive actions → **Server Actions or API Routes** only
- **Supabase is the single source of truth**
- Never duplicate business logic
- Permissions are **deny by default**

**Validation & Error Handling:**

- All inputs validated with **Zod** on the server side
- Configs centralized in `lib/config/*.ts`
- Never invent limit values; always read `src/lib/config/limits.ts` as the source of truth
- Array limits to prevent DoS attacks
- Duplicate prevention with case-insensitive checks (`.ilike()`)
- Error boundaries at root and authenticated layout levels
- Loading states on all mutations to prevent double-submit
- Toast notifications for user feedback (Sonner)

**Database Patterns:**

- RLS policies on all tables filtering by `user_id`
- Database triggers for automatic cleanup operations
- `ON DELETE CASCADE` for child records
- `ON DELETE SET NULL` for optional references
- Timestamps (`created_at`, `updated_at`) on all tables
- Enums for status fields (e.g., `pending`, `processing`, `completed`, `failed`)

### Project Structure

```bash
src/
├── actions/              # Server Actions (CRUD by domain)
├── app/
│   ├── (authenticated)   # Protected routes
│   ├── (marketing)       # Public landing pages
│   ├── api/              # API routes (file uploads, webhooks)
│   ├── auth/             # Auth pages (signin, signup, callback)
│   ├── error.tsx         # Root error boundary
│   └── layout.tsx
├── components/
│   ├── app/              # App-specific (header, sidebar, footer)
│   ├── features/         # Feature components by domain
│   ├── ui/               # shadcn/ui components
│   └── commons/          # Shared components (logo, etc.)
├── data/
│   └── constants/        # App constants (categories, units, nav)
├── hooks/                # Custom React hooks
├── lib/
│   ├── config/           # Configurable limits and settings
│   ├── supabase/         # Supabase clients (server, client)
│   ├── validations/      # Zod schemas by domain
│   └── utils.ts          # Utilities (cn, etc.)
├── providers/            # React context providers
└── utils/                # Helper functions (formatters, etc.)

supabase/
├── config.toml
├── functions/            # Edge Functions
└── migrations/           # SQL migrations (timestamped)
```

---

## 4. Code Style Guidelines

### 4.1 Import Ordering

**Pattern (NO blank lines between groups):**

```typescript
'use server' // or 'use client' - directive first
import { useState } from 'react' // React
import { useRouter } from 'next/navigation' // Next.js
import { revalidatePath } from 'next/cache' // Next.js utilities
import { createClient } from '@/lib/supabase/server' // External/Supabase
import { Button } from '@/components/ui/button' // External UI
import { Loading03Icon } from '@hugeicons/react' // Icons
import { createBaseList } from '@/actions/base-lists' // Server actions
import { createBaseListSchema } from '@/lib/validations/base-list' // Validations
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits' // Config
import { Dialog } from '@/components/ui/dialog' // Components
import { formatDate } from '@/utils/format-date' // Utils
```

**Key Rules:**

- Directive (`'use server'` or `'use client'`) always first
- NO blank lines between import groups
- Individual component imports (not barrel exports)
- External dependencies before internal ones

### 4.2 TypeScript Patterns

**Zod Schemas for Validation:**

```typescript
// lib/validations/base-list.ts
import { z } from 'zod'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

export const createBaseListSchema = z.object({
	group_id: z.string().uuid(),
	name: z.string().min(1, 'Name is required').max(100),
})

export const updateBaseListSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100).optional(),
})

// Type exports at END of file
export type CreateBaseListInput = z.infer<typeof createBaseListSchema>
export type UpdateBaseListInput = z.infer<typeof updateBaseListSchema>
```

**Type Usage:**

- Server action inputs: `unknown` type (forces explicit validation)
- Component props: `interface` named `Props`
- Return types: rely on inference (not explicitly typed)
- Minimal `any` usage (only for Supabase responses when needed)
- Types exported at END of validation files using `z.infer<>`

### 4.3 Error Handling

**SERVER ACTIONS (NO try-catch):**

Pattern: Early returns with `{ error: string }` or `{ data: T }` or `{ success: true }`

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
