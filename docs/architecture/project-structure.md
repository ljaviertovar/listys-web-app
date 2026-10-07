# Project Structure

Listys uses a domain-oriented Next.js App Router structure. The application is a Supabase-backed SaaS for reusable
shopping lists, collaborative shopping sessions, purchase history, and receipt OCR. The tree below documents the
current repository and the intended placement for new code.

Generated directories such as `.next/`, `test-results/`, `playwright-report/`, and coverage output are intentionally
omitted from this document.

```text
├── .agents/                              # Project-installed skills and agent support files
├── AGENTS.md                             # Automated-contributor engineering policy
├── CHANGELOG.md                          # Notable application and documentation changes
├── docs/
│   ├── README.md                         # Documentation index and topic ownership
│   ├── architecture/
│   │   ├── architecture.md               # System architecture and API policy
│   │   └── project-structure.md          # This document
│   ├── design/                           # Design system and visual specifications
│   ├── prd/
│   │   ├── PRD-v1.md                     # Historical product scope
│   │   └── PRD-v2.md                     # Current product requirements
│   ├── runbooks/
│   │   ├── deploy.md                     # Deployment procedures
│   │   └── incidents.md                  # Incident response procedures
│   ├── git-commits.md                    # Commit conventions
│   └── tooling-delegation.md             # Skill and tooling selection policy
├── e2e/                                  # Versioned Playwright specs; generated results/reports remain ignored
├── openspec/                             # Specifications and planned changes
├── package.json                          # Runtime dependencies and development commands
├── playwright.config.ts                  # End-to-end test configuration
├── public/
│   ├── icons/pwa/                        # PWA icons and platform-specific assets
│   ├── images/                           # Static application images
│   ├── offline.html                      # Offline fallback document
│   └── listys-logo.*                     # Public brand assets
├── scripts/                              # Maintenance, diagnostics, and code-generation scripts
├── src/
│   ├── test/                             # Shared Vitest/Testing Library setup and fixtures
│   ├── actions/                          # Server Actions organized by domain
│   ├── app/
│   │   ├── (authenticated)/              # Protected routes and authenticated application shell
│   │   │   ├── error.tsx                 # Authenticated-segment error boundary
│   │   │   └── layout.tsx                # Session guard and authenticated shell
│   │   ├── (marketing)/                  # Public marketing routes and shell
│   │   ├── api/
│   │   │   ├── v1/                       # Versioned REST resources and domain actions
│   │   │   ├── health/                   # Health-check endpoint
│   │   │   ├── tickets/                  # Existing ticket status endpoint
│   │   │   └── upload-ticket/            # Ticket-upload endpoint
│   │   ├── auth/                         # Sign-in, sign-up, and OAuth callback routes
│   │   ├── error.tsx                     # Root error boundary
│   │   ├── favicon.ico
│   │   ├── globals.css                   # Global styles and design tokens
│   │   ├── layout.tsx                    # Root document layout and providers
│   │   ├── loading.tsx                   # Root loading UI
│   │   └── manifest.ts                   # PWA manifest metadata
│   ├── components/
│   │   ├── app/                          # Authenticated application shell (sidebar, topbar, main)
│   │   ├── commons/                      # Truly shared components, the locale switcher, and app-owned icons
│   │   ├── features/                     # Main-application feature components by domain
│   │   ├── marketing/                    # Public shell (header, footer, nav)
│   │   │   └── landing-page/             # Landing-page sections and landing-only primitives
│   │   └── ui/                           # Reusable shadcn/Radix/Magic UI primitives
│   ├── data/
│   │   └── constants/                     # Static application constants
│   ├── hooks/                             # Shared React hooks
│   ├── lib/
│   │   ├── api/                           # API client, HTTP helpers, endpoint clients, and API auth
│   │   │   └── endpoints/
│   │   ├── config/                        # Limits and OCR/provider configuration
│   │   ├── server/
│   │   │   └── services/                  # Reusable server-side domain operations
│   │   ├── supabase/                      # Supabase clients by runtime
│   │   └── validations/                   # Shared Zod schemas and API schemas
│   ├── providers/                         # React context providers
│   ├── stores/                            # Zustand stores for client-only state
│   ├── test/                              # Shared Vitest and Testing Library setup
│   ├── types/                             # Shared domain and generated database types
│   │   ├── database.types.ts
│   │   ├── navigation.ts
│   │   └── <domain>.ts
│   ├── proxy.ts                           # Authentication proxy (middleware) entry point
│   └── utils/                             # Generic helpers and formatters
├── supabase/
│   ├── config.toml                       # Supabase local/project configuration
│   ├── functions/                         # OCR Edge Functions
│   └── migrations/                        # Version-controlled timestamped SQL migrations
├── next.config.ts                         # Next.js configuration
├── tsconfig.json                          # TypeScript configuration
├── vitest.config.ts                       # Vitest configuration
└── README.md                              # Project overview and setup instructions
```

## Component Buckets

`src/components/` has exactly five buckets. Decide with this order:

| Bucket       | Holds                                                                                            | Examples                                                  |
| ------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `ui/`        | shadcn/Radix primitives and their thin local wrappers, with no feature behavior                  | `button.tsx`, `custom/checkbox-group-custom.tsx`          |
| `commons/`   | Presentational pieces shared by two or more unrelated domains, plus every application-owned icon | `status-check.tsx`, `locale-switcher.tsx`, `icons/`       |
| `features/`  | Main-application feature components, one folder per domain                                       | `features/auth/`, `features/base-lists/`, `features/tickets/` |
| `marketing/` | The public shell and public pages                                                                | `header.tsx`, `footer.tsx`, `landing-page/`               |
| `app/`       | The authenticated application shell                                                              | `app-sidebar.tsx`, `app-topbar.tsx`, `app-main.tsx`       |

A component belongs to the narrowest bucket that still covers all of its consumers. Brand elements and neutral
presentational pieces belong in `commons/`; landing-only sections stay in `marketing/landing-page/`; authenticated
application structure belongs in `app/`.

`marketing/` and `app/` never share a shell component. The public pages present Listys and its shopping-list and OCR
workflows; the authenticated app is the working surface with its sidebar, header, pages, and active-session state. A
single "smart" header switching between the two on a prop is exactly what these two buckets exist to prevent.
Genuinely neutral controls may be shared through `commons/` or their owning feature barrel.

## Component Selection Order

Before creating a component or writing custom component styles:

1. Inspect the components already installed from the project's active frontend/UI libraries, including
   `src/components/ui/` and `components.json`.
2. Search the application's existing components and public barrel exports for a reusable component, variant, or
   composition that already covers the requirement.
3. If no installed component fits, search the active library's registry and documentation for a suitable component
   that can be installed through its documented workflow.
4. Prefer composition, existing props, and variants over duplicating markup or introducing a near-copy.
5. Create a new component or custom primitive only when no reasonably similar library or application component exists,
   and place it in the narrowest bucket that owns its behavior.

Do not replace an available shadcn/Radix or other active-library primitive with a styled `div`. A feature may wrap or
compose a primitive to add domain behavior, but that behavior belongs outside `src/components/ui/`.

## Placement Rules

- Keep each feature cohesive. Landing-page-only UI, behavior, and styles belong in
  `src/components/marketing/landing-page/`; main-application feature UI belongs in `src/components/features/<domain>/`.
- Treat every large component that owns child components as its own domain/module and give it local
  `hooks/`, `helpers/`, `utilities/`, `tests/`, and nested `components/` folders as needed, e.g.
  `components/marketing/landing-page/demo/hooks/`. Place a new file in the folder of that kind nearest to the
  component it belongs to, not in a farther-up shared one; promote to a shared top-level folder (such as
  `src/hooks/` or `src/components/commons/`) only once a second, unrelated domain needs the same logic. See "Custom Hook
  Extraction" in `AGENTS.md` for when a component's logic must be pulled into a hook in the first place.
- Put the public shell in `src/components/marketing/` and the authenticated application shell in
  `src/components/app/`; put a component in `commons/` only when multiple domains can use it.
- Own the shell in the route group, not in the root `src/app/layout.tsx`. The root layout owns document scope, fonts,
  global providers, PWA registration, and the toaster. `(marketing)/layout.tsx` renders the public marketing shell and
  `(authenticated)/layout.tsx` renders the authenticated shell behind its session guard. A new route group brings its
  own shell and data boundary.
- Keep shadcn/Radix primitives in `src/components/ui/` and avoid adding feature behavior to those files.
- Use route groups such as `(marketing)` and `(app)` to express ownership without changing public URLs.
- Organize Server Actions by domain and keep secrets or external API calls in server-only modules.
- Put reusable Zod schemas in `src/lib/validations/` and export their inferred TypeScript types.
- Put infrastructure clients in `src/lib/<service>/` and identify the runtime in the filename, such as `client.ts`.
- Follow the barrel policy in `AGENTS.md`: when a domain or folder exposes more than two public modules, add a flat
  `index.ts`/`index.tsx` that exports only its public surface and import through it. A module's own siblings still import
  each other directly; the barrel is the boundary for outside consumers.
- Co-locate feature-specific CSS modules with the component that consumes them; keep only global CSS in `src/app/`.
  Next's file-based icon/manifest metadata (`favicon.ico`, `manifest.ts`) must remain at the root `app/` segment by
  framework convention.
- Put every test in the `tests/` folder of the domain/module it belongs to (e.g.
  `components/features/tickets/tests/ticket-actions.test.ts`, `lib/validations/tests/ticket.test.ts`),
  not loose next to the file under test, and keep shared test-environment setup in `src/test/`. Playwright specs are the
  exception and live in the top-level `e2e/` folder.
- Add top-level buckets such as `stores/`, `src/app/api/`, or `supabase/migrations/` only when implemented behavior
  requires them.

## Growth Rules

- Add a new feature under `src/components/features/<domain>/` and pair it with domain types in `src/types/`, actions,
  validations, and services only as needed.
- Keep list groups, base lists, shopping sessions, sharing, tickets, and OCR behavior in their existing domain modules;
  do not place unrelated feature logic in `commons/` or `ui/`.
- Add protected routes under `src/app/(authenticated)/`; the group's `layout.tsx` re-checks the session as defense in
  depth behind the auth middleware and wraps the page in the authenticated shell.
- Add a new authenticated-only shell part to `src/components/app/` and compose it in
  `(authenticated)/layout.tsx`, next to the existing `AppSidebar` and `Header`. Do not reach for a marketing shell
  component and add a mode prop to it.
- Add versioned route handlers under `src/app/api/v{major}/...` for public HTTP endpoints that require a REST contract;
  follow the complete API policy in `AGENTS.md` and do not add an unversioned `/api/` alias.
- Keep `supabase/migrations/` version-controlled for implemented list, shopping-session, ticket, sharing, trigger, and
  RLS behavior. Review every migration for direct or indirect record deletion before applying it.
- Add new canonical documents to `docs/README.md` and keep exactly one source of truth per topic.
- Update this document and `architecture.md` whenever a new top-level responsibility is introduced.

Use this structure unless an explicit architectural decision says otherwise. When an existing module follows a
different convention, preserve that module's local consistency and document the exception before introducing another
pattern.
