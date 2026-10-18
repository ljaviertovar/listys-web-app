# Deploy runbook

This procedure covers the web app and Supabase dependencies. Repository evidence does not establish the live hosting
provider, target project, CI deployment or release owner.
[Open question: record approved staging/production targets, release owner, secret store and backup/restore owner.]

## Prepare a release

1. Select the reviewed commit; confirm target and release owner. Preserve unrelated local changes.
2. Install from `pnpm-lock.yaml` with `pnpm install --frozen-lockfile`.
3. Run `pnpm lint`, `pnpm typecheck`, `pnpm test:ci`, `pnpm verify:limits-reference` and `pnpm build`. Record actual
   results. Do not run Playwright until the [E2E blocker](../contributing/CONTRIBUTING.md#playwright-boundary) is resolved.
4. Verify web configuration against the [setup guide](../../README.md). Check presence and target identity without
   logging values. Confirm Auth site/redirect URLs; set `NEXT_PUBLIC_SITE_URL` when testing experimental invitations.
5. Verify the selected OCR Edge Function is deployed to the same Supabase target with its provider secret in that
   runtime. A web deployment does not deploy functions or their secrets.

## Database and storage gate

Before **any** migration, inspect affected SQL, triggers, functions and foreign keys for direct/indirect record removal
or destructive rewrites. Never run a blanket push/reset to start the app or tests. Potentially destructive migrations
require explicit user confirmation under AGENTS.md. Review historical migrations too when provisioning a fresh target;
this documentation audit applied none.

Record the reviewed migration set, target identity, compatible application versions and backup/recovery plan before
the approved migration process. Verify Storage bucket/policies, RLS and required RPCs in the target. Experimental
collaboration additionally needs the shared-list, realtime-publication and collaborator-policy migrations; their
presence in the repository does not prove deployment.

## Publish and check

Publish through the confirmed hosting platform. `pnpm start` serves a built Next.js app for a suitable server deployment.
If the environment uses Vercel, follow its approved preview/production process; automatic deployment is unverified.

With a test account and synthetic data in the intended environment:

- Check `GET /api/health`: `200`/`ok` means its API/database checks passed; `503`/`degraded` means at least one failed.
  It does not check OCR providers, Storage or realtime delivery.
- Verify sign-in, protected navigation, group/list creation, shopping start/completion and history.
- Upload a synthetic receipt through `POST /api/v1/tickets`; follow its status to completion or a controlled failure.
  A `202` response alone does not validate OCR completion.
- For an experimental collaboration release, check acceptance, removal and realtime with separate test accounts.
- Inspect redacted application/function logs and clean up only fixtures created for this release check.

## Recovery

Redeploy the previous compatible web artifact through the hosting platform. Do not automatically reverse migrations
or reset Supabase: app rollback and data recovery are separate operations. Data restoration or destructive operations
need a reviewed backup/recovery procedure and explicit authorization. Use the [incident runbook](incidents.md).
