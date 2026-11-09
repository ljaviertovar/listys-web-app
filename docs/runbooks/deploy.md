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

### Conditional trip item editing release

For `reliable-active-trip-autosave`, review `20261108041549_reliable_active_trip_autosave.sql` before applying it to the explicitly
selected target. It adds the version column/trigger and authenticated item RPCs, configures the normalizer search path and revokes direct
client DML. It does not delete/recalculate existing rows; the DELETE statement defines the explicit item-delete RPC rather than executing
a deletion during migration. Do not blanket-push historical migrations to provision tests.

The migration also moves the seven-argument receipt implementation into `private` and installs a public ownership-checked wrapper;
keep this step with the DML revocation so existing receipt attachment remains functional.

Deploy the schema before activating its consumers. Coordinate the permission change, PATCH v2 application and immediate v1 retirement
in a controlled release window: old clients receive `410 CLIENT_UPDATE_REQUIRED` and must reload. Verify existing receipt RPCs under the
final grants and owner/collaborator permissions before opening writes. Do not claim cross-device protection while an unconditional
writer remains enabled. Run the rollback-only `supabase/tests/trip-item-versions.sql` and isolated two-context Playwright scenarios on
the local verification environment; the tests do not reset shared data and never use hosted application credentials.

After activation, verify two saves with the same expected version produce one effective update and one conflict; confirm a late save
after completion is rejected. Observe operation outcome/error code, request ID and duration without logging item/receipt content.
Rollback preserves the column and pending queues: suspend manual item writes or disable the new UI and fix forward. Do not restore
unconditional v1 writes or remove version data as a rollback.

Publish through the confirmed hosting platform. `pnpm start` serves a built Next.js app for a suitable server deployment.
If the environment uses Vercel, follow its approved preview/production process; automatic deployment is unverified.

With a test account and synthetic data in the intended environment:

- Check `GET /api/health`: `200`/`ok` means its API/database checks passed; `503`/`degraded` means at least one failed.
  It does not check OCR providers, Storage or realtime delivery.
- Verify sign-in, protected navigation, list creation, shopping start/completion and history.
- Upload a synthetic receipt through `POST /api/v1/tickets`; follow its status to completion or a controlled failure.
  A `202` response alone does not validate OCR completion.
- For an experimental collaboration release, check acceptance, removal and realtime with separate test accounts.
- Inspect redacted application/function logs and clean up only fixtures created for this release check.

## Recovery

Redeploy the previous compatible web artifact through the hosting platform. Do not automatically reverse migrations
or reset Supabase: app rollback and data recovery are separate operations. Data restoration or destructive operations
need a reviewed backup/recovery procedure and explicit authorization. Use the [incident runbook](incidents.md).
