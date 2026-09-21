# Listys Web App

Listys is a SaaS application for organizing shopping: it lets users create base lists, start shopping sessions, and process receipts with OCR to turn them into reusable items. This `README.md` is a quick-start guide; extended documentation lives in [`docs/README.md`](docs/README.md).

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Auth, Postgres + RLS, Storage, Edge Functions)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- zustand

## Requirements

- Node.js 20+
- npm 10+
- A Supabase project and configuration

## Quick Start (5 minutes)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with the minimum variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

   Optional provider-specific OCR variables:

   ```bash
   PROCESS_TICKET_OCR_PROVIDER=gemini
   OPENAI_API_KEY=...
   ```

3. If applicable, initialize and start local Supabase:

   ```bash
   npx supabase start
   npx supabase db push
   ```

4. Start development:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Essential commands

```bash
npm run dev
npm run build
npm run lint
tsc --noEmit
```

## Documentation Map

- Main documentation: [`docs/README.md`](docs/README.md)
- Product requirements: [`docs/prd/PRD-v2.md`](docs/prd/PRD-v2.md)
- Architecture: [`docs/architecture/architecture.md`](docs/architecture/architecture.md)
- Runbooks: [`docs/runbooks/`](docs/runbooks/)
- Agent guidance: [`AGENTS.md`](AGENTS.md)
- Contribution guide: [`docs/contributing/CONTRIBUTING.md`](docs/contributing/CONTRIBUTING.md)

---

For technical details, deployment, diagrams, or operational procedures, see [`/docs`](docs/README.md).
