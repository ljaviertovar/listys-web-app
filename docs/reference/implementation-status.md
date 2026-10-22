# Implementation status

Reviewed on 2026-10-17 against the working tree. This document owns observed behavior and implementation gaps;
[PRD v2](../prd/PRD-v2.md) remains the MVP baseline. Code presence does not establish deployment or E2E validation.

## Implemented product flows

| Area | Observed behavior | Evidence |
| --- | --- | --- |
| Authentication | Email/password registration/sign-in, Google OAuth, callback exchange, sign-out and protected layouts. Password reset links to an unimplemented route. | [`auth/`](../../src/app/auth/), [`auth-form.tsx`](../../src/components/features/auth/auth-form.tsx), [`proxy.ts`](../../src/proxy.ts) |
| Dashboard | Next-trip/active-session views, groups and lists, receipts, history, loading and error states. | [`dashboard/page.tsx`](../../src/app/(authenticated)/dashboard/page.tsx), [`build-dashboard-model.ts`](../../src/components/features/dashboard/helpers/build-dashboard-model.ts) |
| Groups and lists | CRUD, duplicate-name checks, notes, quantities/categories/order and reusable shopping templates. | [`groups.service.ts`](../../src/lib/server/services/groups.service.ts), [`base-lists.service.ts`](../../src/lib/server/services/base-lists.service.ts) |
| Shopping | Owner starts a nonempty base list; items clone in purchase-count, recency, sort-order sequence. Check/edit/add/delete, complete with amount/notes and optional sync, or cancel. The service checks for an existing active session. | [`shopping-sessions.service.ts`](../../src/lib/server/services/shopping-sessions.service.ts) |
| History | Completed sessions globally/by group, totals and detail navigation. No service/action for creating a list from a completed session was found. | [`shopping-history/`](../../src/app/(authenticated)/shopping-history/), [`session service`](../../src/lib/server/services/shopping-sessions.service.ts) |
| Receipts | Multi-photo upload, OCR, status/errors, manual retry, viewer/compare, selection, merge/create list, group assignment, deletion with attempted image cleanup. No extracted-item editing endpoint was found. | [`tickets.service.ts`](../../src/lib/server/services/tickets.service.ts), [`tickets/`](../../src/components/features/tickets/) |
| Enrichment | Normalized names and purchase-memory fields are defined in migrations; existing-list merge uses an RPC. Session ordering reads enrichment fields. | [`enrichment migration`](../../supabase/migrations/20260214000000_prd_v2_enrichment_and_transactions.sql), [`ticket service`](../../src/lib/server/services/tickets.service.ts) |
| Account/profile | Read-only identity, provider, verification and account metadata; no account deletion or full export flow. | [`settings/`](../../src/app/(authenticated)/settings/) |
| PWA | Manifest, install UI, service worker and offline fallback; no offline shopping mutation/sync implementation. | [`manifest.ts`](../../src/app/manifest.ts), [`pwa-register.tsx`](../../src/components/features/pwa/pwa-register.tsx), [`sw.js`](../../public/sw.js) |

## Experimental collaboration

**Product decision, 2026-10-17:** collaboration remains experimental and excluded from the MVP. This section describes
existing code, not an expansion of PRD v2.

- Owners can create/regenerate/revoke invite links with optional expiry (1–30 days) and use limit (1–100). Omitting
  these options leaves them unset. Creating a link revokes the existing active links first.
- Authenticated invitees can accept valid links for `editor` access. The service returns the list and its active
  session, if one exists, for navigation.
- Owners can remove collaborators; collaborators can remove themselves. Link revocation blocks future acceptance
  but does not remove previously admitted collaborators.
- List/session-item listeners subscribe to Postgres changes and refresh the page. The data model includes
  `list_collaborators`, `list_invite_links`, and `shopping_session_participants` with RLS migrations.
- Collection reads and several mutations remain owner-filtered. Do not assume all owner operations are available
  to collaborators because some shared reads/writes are permitted by RLS.

Evidence: [`sharing service`](../../src/lib/server/services/sharing.service.ts),
[`sharing schemas`](../../src/lib/validations/sharing.ts),
[`shared-list migration`](../../supabase/migrations/20260401000000_shared_lists.sql),
[`publication migration`](../../supabase/migrations/20260429000000_enable_realtime_for_list_items.sql),
[`collaborator RLS migration`](../../supabase/migrations/20260429000001_fix_realtime_collaborator_rls_policies.sql),
[`base-list listener`](../../src/components/features/base-lists/base-list-realtime-listener.tsx), and
[`session listener`](../../src/components/features/shopping-sessions/shopping-session-realtime-listener.tsx).

## Routes and receipt processing

Public pages: `/`, `/auth/signin`, `/auth/signup`; `/auth/callback` handles Auth callbacks.
Protected pages: `/dashboard`, `/shopping-lists`, `/shopping-lists/{groupId}/lists`,
`/base-lists/{baseListId}/edit`, `/shopping/{runId}`, `/shopping-history`, `/shopping-history/{groupId}`,
`/tickets`, `/tickets/{ticketId}`, `/settings/profile`, and `/settings/account`.
`/profile` and `/account` redirect to settings. `/invite/{token}` is the experimental protected invite flow.

Canonical upload is `POST /api/v1/tickets`: `202` with `{ "data": { "ticketId": "..." } }`.
The service uploads to user-prefixed paths in the `tickets` bucket and inserts a pending ticket. It creates one-hour
signed image URLs and dispatches the selected OCR Edge Function without awaiting it. This fetch dispatch is not a
durable job queue. Functions set `processing`, write extracted items, and set `completed` or `failed`; the UI uses
status reads and realtime. Retry clears existing extracted items before reprocessing.

[`ocr.ts`](../../src/lib/config/ocr.ts) selects Gemini by default or OpenAI when explicitly configured. Provider secrets
belong in the function runtime; see the [setup guide](../../README.md). The older `process-ticket-ocr` function remains
in the repository but is not selected by this configuration.

Deletion attempts Storage API removal before deleting the ticket. Storage errors are logged and do not prevent database
deletion, so orphaned images remain possible. The direct-storage deletion trigger was removed in the
[`20260215000002` migration](../../supabase/migrations/20260215000002_remove_storage_direct_access_trigger.sql).
The [API reference](api-v1.md) owns compatibility details; [limits](limits.md) owns values derived from code.

## PRD v2 acceptance gaps

| Requirement | Repository evidence and remaining verification |
| --- | --- |
| Review/edit extracted items | Review, selection and merge exist; editing OCR items is absent from the inspected UI/API. |
| History creates a base list with provenance | History/detail views exist; no `createBaseListFromSession` was found in actions or services. |
| Transactional completion and sync | Sync uses an RPC, but the service marks completion first. Sync failure can leave a completed session. |
| Idempotent merge and bounded automatic retries | Merge RPC/attempt fields do not establish request-level idempotency or exponential retries. Gemini checks a three-attempt cap; OpenAI increments attempts without the same cap, and the web retry service does not enforce it. See [`Gemini`](../../supabase/functions/process-ticket-ocr-gemini/index.ts), [`OpenAI`](../../supabase/functions/process-ticket-ocr-openai/index.ts) and [`retry service`](../../src/lib/server/services/tickets.service.ts). |
| Performance, retention, conversion and reliability targets | PRD goals remain targets; production measurements and telemetry were not verified. |

## Audit findings and follow-up

These are remaining application/operational tasks; the documentation update does not fix them.

| Priority | Finding | Evidence and next action |
| --- | --- | --- |
| Critical | E2E cleanup deletes table-wide data; credentials do not use required `E2E_SUPABASE_*` inputs. | [`db-reset.ts`](../../e2e/helpers/db-reset.ts), [`global-teardown.ts`](../../e2e/global-teardown.ts), [`supabase-client.ts`](../../e2e/helpers/supabase-client.ts). Replace broad resets with fixture-scoped cleanup and align credentials before running suites. |
| High | Several APIs return selected database rows; collections lack pagination metadata/links; write schemas generally strip unknown fields. | [`http.ts`](../../src/lib/api/http.ts), [`group service`](../../src/lib/server/services/groups.service.ts), [`base-list service`](../../src/lib/server/services/base-lists.service.ts), [`group schemas`](../../src/lib/validations/group.ts). Add DTOs and bounded contracts to meet AGENTS.md. |
| High | Unexpected errors can expose `error.message`; services often include database messages. | [`http.ts`](../../src/lib/api/http.ts). Sanitize outward errors and add safe structured server logs. Request IDs alone are not a complete observability system. |
| High | No complete OpenAPI/equivalent response schema, request idempotency/conditional-update mechanism or application rate-limit implementation was found. | [`API reference`](api-v1.md), [`handlers`](../../src/app/api/v1/), [`helpers`](../../src/lib/api/). Treat these as follow-up requirements. |
| High | Completion/sync, session cloning and invite use-count updates involve separate writes. | [`session service`](../../src/lib/server/services/shopping-sessions.service.ts), [`sharing service`](../../src/lib/server/services/sharing.service.ts). Verify concurrency/failure recovery before claiming atomicity. |
| High | Server Actions and HTTP services duplicate domain implementations instead of consistently sharing one service layer. | [`actions/`](../../src/actions/), [`services/`](../../src/lib/server/services/). Consolidate behavior or verify both paths when fixing validation, authorization and business rules. |
| Medium | Three deprecated v1 aliases still advertise the already-passed 2026-09-30 sunset. | [Compatibility inventory](api-v1.md#compatibility-and-migration). Agree the migration/removal plan before changing routes or dates. |
| Medium | Password reset and two PRD journeys remain incomplete; production SLOs are unverified. | Acceptance gaps above and [design gaps](../design/DESIGN.md#114-current-implementation-gaps). |
| Medium | No tracked CI workflows; release ownership, alert configuration, backup verification and retention decisions remain unestablished. | [Deploy](../runbooks/deploy.md), [incidents](../runbooks/incidents.md), and [privacy](../privacy/taste-profile.md) record open questions. |

## Audit boundaries

Substantial application and design-document edits existed before the review. Findings describe that working tree;
unrelated changes were preserved. No remote data, migrations, destructive maintenance, E2E cleanup, production
deployments or provider calls were executed for this audit.
