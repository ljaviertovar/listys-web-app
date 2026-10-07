# Deploy Runbook

## Purpose

Procedure for deploying the Listys application to staging or production.

## Prerequisites

- Credentials with access to the project (hosting provider, secrets manager, Supabase).
- CI configured (GitHub Actions or another system) with environment variables.

## Steps (manual)

1. Update the `main` branch: `git fetch && git checkout main && git pull`.
2. Run local tests and the linter:

```bash
pnpm install
pnpm test
pnpm lint
```

3. Build the application:

```bash
pnpm build
```

4. Publish the artifact according to the platform (Vercel or self-hosted). For Vercel, create a release and enable the automatic deployment.

5. Verify Supabase migrations: review `supabase/migrations` and apply them in the target environment through CI tooling or manually.

6. Post-deployment checks:

- Smoke test: sign in, create a base list, and upload a receipt (happy path).
- Review Edge Function logs and the OCR queue.

## Rollback

- On Vercel: revert to the previous version from the dashboard.
- For the database: prepare rollback migrations and execute them carefully.

## Contacts

- Team: @dev-team
