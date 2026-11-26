# Listys Web App

Listys turns scanned or uploaded receipts into reusable shopping lists. Use them to shop by store, reconcile purchases
with trip receipts, and review receipt-backed spending. [PRD v2](docs/prd/PRD-v2.md) defines the MVP baseline, and
[PRD v4](docs/prd/PRD-v4.md) defines the current product scope. Shared lists and collaborative shopping are experimental.

## Stack and requirements

- Next.js 16.1.0, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.
- Supabase Auth, Postgres with RLS, Storage, Realtime, and OCR Edge Functions. Current services use Supabase directly,
  without Prisma.
- React Hook Form, Zod, and Zustand.
- Node.js 20.9 or newer and pnpm. The dependency lockfile is `pnpm-lock.yaml`.
- A provisioned Supabase development environment; Docker if running Supabase locally.

## Local development

1. Install dependencies with `pnpm install`.
2. Create an ignored `.env.local` using the variable names below. Obtain values from the intended environment's
   approved secret store; do not copy production credentials into development.
3. Use an existing development database with the required migrations, Storage bucket, Auth configuration, and
   selected OCR function. Provisioning requires the review in the [deployment runbook](docs/runbooks/deploy.md);
   starting the web app does not provision Supabase.
4. Run `pnpm dev` and open `http://localhost:3000`.

| Variable                               | Runtime and purpose                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Web app: Supabase endpoint.                                                                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web app: public client key.                                                                |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server only: OCR dispatch and privileged invite acceptance.                                |
| `PROCESS_TICKET_OCR_PROVIDER`          | Server: `gemini` (default) or `openai`.                                                    |
| `NEXT_PUBLIC_SITE_URL`                 | Absolute origin for experimental invite links; defaults to localhost when omitted.         |
| `NEXT_PUBLIC_APP_URL`                  | Optional server-side API-client origin fallback; incoming request headers take precedence. |
| `NEXT_PUBLIC_PWA_DEV`                  | Optional: `true` enables service-worker registration in development.                       |

Provider secrets belong in the selected **Supabase Edge Function environment**, rather than only in `.env.local`:
`GEMINI_API_KEY` for `process-ticket-ocr-gemini`, or `OPENAI_API_KEY` for `process-ticket-ocr-openai`.
Those functions also read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in their own runtime.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm verify:limits-reference
pnpm build
```

`pnpm test` starts Vitest watch mode; `pnpm test:critical` runs the critical server/shared-logic subset.
Playwright uses an isolated local Supabase. Legacy suites still use table-wide reset helpers. Follow the
[E2E execution boundary](docs/contributing/CONTRIBUTING.md#playwright-boundary) when selecting a suite.

## Documentation

- [Documentation index and topic ownership](docs/README.md)
- [Implemented behavior, MVP gaps, and audit findings](docs/reference/implementation-status.md)
- [Architecture](docs/architecture/architecture.md) and [repository structure](docs/architecture/project-structure.md)
- [Design System](docs/design/design-system.html), the only source of truth for UI; earlier design files are historical references
- [Deployment](docs/runbooks/deploy.md), [incidents](docs/runbooks/incidents.md), and [data handling](docs/privacy/taste-profile.md)
- [Agent engineering rules](AGENTS.md) and [tooling workflow](docs/tooling-delegation.md)
