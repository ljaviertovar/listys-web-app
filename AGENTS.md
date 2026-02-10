# AGENTS.MD - Coding Guidelines for Listys Web App

This document provides coding guidelines and best practices for AI agents working on this Next.js/Supabase SaaS application.

## Table of Contents

- [1. Commands](#1-commands)
- [2. Model Context Protocol (MCP) Servers](#2-model-context-protocol-mcp-servers)
- [3. Architectural Principles](#3-architectural-principles)
- [4. Code Style Guidelines](#4-code-style-guidelines)
- [5. Database & Migrations](#5-database--migrations)
- [6. UX & Error Handling](#6-ux--error-handling)
- [7. Commit Guidelines](#7-commit-guidelines)

---

## 1. Commands

### Development

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

```typescript
export async function createItem(data: unknown) {
	const supabase = await createClient()

	// 1. Auth check
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: 'Unauthorized' }

	// 2. Input validation
	const validation = schema.safeParse(data)
	if (!validation.success) {
		return { error: validation.error.errors[0].message } // First error only
	}

	// 3. Business logic validation (limits, duplicates)
	const { count } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

	if (count && count >= MAX_ITEMS) {
		return { error: `Maximum ${MAX_ITEMS} items allowed` }
	}

	// 4. Database operation
	const { error } = await supabase.from('items').insert({ ...validation.data, user_id: user.id })

	if (error) return { error: error.message }

	// 5. Revalidate & return
	revalidatePath('/items')
	return { success: true }
}
```

**CLIENT COMPONENTS (try-catch):**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault()
	setError(null)
	setLoading(true)

	try {
		const { error } = await createItem({ name })
		if (error) throw new Error(error)

		toast.success('Item created successfully')
		setOpen(false)
		router.refresh()
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to create item'
		setError(message)
		toast.error(message)
	} finally {
		setLoading(false)
	}
}
```

**Key Differences:**

- Server actions: NO try-catch, early returns
- Client components: try-catch with state management
- Always use `toast.error()` / `toast.success()` for user feedback

### 4.4 Naming Conventions

**Files:**

```bash
kebab-case for all files:
- create-base-list-dialog.tsx
- shopping-runs.ts
- format-date.ts
```

**Functions:**

```typescript
// Server actions: verb-noun pattern
export async function getItems()
export async function createItem(data: unknown)
export async function updateItem(id: string, data: unknown)
export async function deleteItem(id: string)

// Event handlers: handle prefix
const handleSubmit = async (e: React.FormEvent) => {}
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
```

**Variables & Constants:**

```typescript
// Variables: camelCase (JavaScript/TypeScript)
const baseListId = validation.data.base_list_id
const activeRun = activeRunResult.data

// Database columns: snake_case
// user_id, base_list_id, created_at

// Constants: UPPER_SNAKE_CASE
MAX_ITEMS_PER_BASE_LIST
MAX_GROUPS_PER_USER
```

**Components:**

```typescript
// PascalCase, named exports only (NO default exports)
export function CreateBaseListDialog({ groupId }: Props)
export function UploadTicketForm({ onSuccess }: Props)
```

### 4.5 Validation Patterns

**Centralized Configuration:**

```typescript
// lib/config/limits.ts
export const MAX_GROUPS_PER_USER = 10
export const MAX_ITEMS_PER_BASE_LIST = 250
export const MAX_TICKET_ITEMS_MERGE = 200
```

**Validation Schema with Limits:**

```typescript
// lib/validations/ticket.ts
import { MAX_TICKET_ITEMS_MERGE } from '@/lib/config/limits'

export const mergeTicketItemsSchema = z.object({
	ticket_id: z.string().uuid(),
	base_list_id: z.string().uuid(),
	selected_items: z
		.array(z.string().uuid())
		.min(1, 'At least one item must be selected')
		.max(MAX_TICKET_ITEMS_MERGE, `Cannot merge more than ${MAX_TICKET_ITEMS_MERGE} items`),
})
```

**Usage in Server Actions:**

```typescript
// safeParse pattern - return first error only
const validation = createSchema.safeParse(data)
if (!validation.success) {
	return { error: validation.error.errors[0].message }
}

// Use validated data
const { group_id, name } = validation.data
```

**Key Rules:**

- All limits in `lib/config/limits.ts`
- Custom error messages with limit values
- Array limits to prevent DoS attacks
- Case-insensitive duplicate checks: `.ilike()`

### 4.6 File Organization

**Server Actions:**

```typescript
'use server'

import statements...

// CRUD operations in order
export async function getItems()        // Read (list)
export async function getItem(id)       // Read (single)
export async function createItem(data)  // Create
export async function updateItem(id, data)  // Update
export async function deleteItem(id)    // Delete

// Related operations
export async function getItemsByGroup(groupId)

// Helper functions at bottom (not exported if internal)
async function helperFunction() {
  // ...
}
```

**Components:**

```typescript
'use client'  // if client component

import statements...

interface Props {
  groupId: string
  onSuccess?: () => void
}

export function ComponentName({ groupId, onSuccess }: Props) {
  // 1. State declarations
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2. Hooks
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 3. Event handlers
  const handleSubmit = async (e: React.FormEvent) => {}
  const handleChange = (e: React.ChangeEvent) => {}

  // 4. JSX return
  return (...)
}
```

### 4.7 Comments

**Minimal comments - Code is self-documenting:**

```typescript
// Comments used for:

// 1. Business logic explanations
// Get base list with group_id
const { data: baseList } = await supabase...

// 2. Step markers in complex operations
// Execute updates
for (const item of itemsToUpdate) {

// 3. Important notes
// Note: We don't revalidate here to avoid UI flicker during optimistic updates

// 4. Safety warnings
// Safety check: Prevent DoS from excessive items
```

**NO JSDoc comments** - functions are self-explanatory by name  
**NO type comments** - TypeScript provides types  
**Comment ABOVE code** it describes (not inline)

---

## 5. Database & Migrations

### Migration Naming Convention

```bash
YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
- 20260109000000_initial_schema.sql
- 20260121000000_add_user_preferences.sql
- 20260121000001_cleanup_orphaned_files.sql
```

### RLS Policies

**Enable on ALL user-facing tables:**

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own items"
  ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON table_name
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table Patterns

**Always include:**

```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ...
);
```

**Foreign Key Cascades:**

- Child records: `ON DELETE CASCADE`
- Optional references: `ON DELETE SET NULL`

**Indexes:**

```sql
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_table_foreign_key ON table_name(foreign_key_id);
```

**Enums for Status:**

```sql
CREATE TYPE ocr_status AS ENUM ('pending', 'processing', 'completed', 'failed');
```

---

## 6. UX & Error Handling

### Error Boundaries

**Required locations:**

1. `app/error.tsx` (root level)
2. `app/(authenticated)/error.tsx` (authenticated layout)

```tsx
'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className='error-container'>
			<h1>Something went wrong</h1>
			{process.env.NODE_ENV === 'development' && <pre>{error.message}</pre>}
			<button onClick={reset}>Try again</button>
		</div>
	)
}
```

### Loading States

**ALL mutations must have:**

- [ ] Loading spinner (Loading03Icon from HugeIcons)
- [ ] Disabled form inputs during submission
- [ ] Disabled submit button
- [ ] Dialog protection during loading

**Example:**

```tsx
const [isLoading, setIsLoading] = useState(false)

// In form handler
async function onSubmit(data) {
	setIsLoading(true)
	try {
		await serverAction(data)
		toast.success('Success!')
	} catch (error) {
		toast.error('Failed')
	} finally {
		setIsLoading(false)
	}
}

// In dialog
;<Dialog
	open={open}
	onOpenChange={isLoading ? undefined : setOpen}
>
	<Button disabled={isLoading}>
		{isLoading && <Loading03Icon className='h-4 w-4 animate-spin' />}
		Submit
	</Button>
</Dialog>
```

### Toast Notifications (Sonner)

```typescript
import { toast } from 'sonner'

toast.success('Item created successfully')
toast.error('Failed to create item. Please try again.')
toast.warning('You have reached the maximum limit')
toast.info('Processing your request...')
```

---

## 7. Commit Guidelines

### Format: Conventional Commits

```bash
<type>(scope): short description

Examples:
feat(tickets): add OCR retry with 15min timeout
fix(lists): prevent duplicate names with case-insensitive check
refactor(limits): centralize configurable limits in single file
docs(readme): add Mermaid diagrams for system architecture
```

### Commit Types

- `feat` → New feature for the user
- `fix` → Bug fix
- `refactor` → Code change that neither fixes bug nor adds feature
- `perf` → Performance improvement
- `docs` → Documentation only changes
- `style` → Code style changes (formatting, semicolons, etc.)
- `test` → Adding or updating tests
- `chore` → Build process, dependencies, tooling

### Rules

- Use **English only**
- Use **imperative present tense** (add, fix, implement - NOT added/fixed)
- Keep subject line under **72 characters**
- Do **NOT** use trailing periods
- Avoid vague words (update, changes, stuff)
- Be specific about WHAT changed and WHY

### Scopes

Use domain/feature names:

- Feature domains: `tickets`, `lists`, `groups`, `shopping-sessions`, `auth`
- Infrastructure: `storage`, `database`, `api`
- Core systems: `validation`, `limits`, `config`
- UI layers: `ui`, `components`, `layout`

### Good Examples ✅

```bash
feat(tickets): add OCR retry with 15min timeout
fix(lists): prevent duplicate names with case-insensitive check
refactor(limits): centralize configurable limits in single file
perf(database): add indexes on foreign keys for faster queries
docs(readme): add entity relationship diagram
```

### Bad Examples ❌

```bash
update stuff
fixed bug
changes
improvements
wip
Updated files.
```

---

## Summary

This codebase follows a **Supabase-first architecture** with strong opinions on security, validation, and code organization. Key principles:

- **Security in RLS**, not frontend
- **Server-side validation** with Zod
- **Centralized configuration** in `lib/config/`
- **Consistent patterns** (imports, naming, error handling)
- **User feedback** with loading states and toasts
- **Clean commits** with Conventional Commits format

When in doubt, prioritize **consistency with existing code patterns** and consult the relevant **MCP server** for framework-specific guidance.
