# Implementation status

Reviewed on 2026-10-28 against the working tree and the approved development Supabase project. This document owns observed behavior and implementation gaps;
[PRD v2](../prd/PRD-v2.md) remains the MVP baseline. Code presence does not establish deployment or E2E validation.

## Implemented product flows

### PRD v3 Phase 4: store tags and store-scoped sessions

| Requirement | Observed behavior | Evidence and validation |
| --- | --- | --- |
| FR-10 — item/store statistics | Confirmed receipt merges and completed store-scoped sessions update per-item store counts atomically; receipt prices are retained as the latest store price. There is no historical backfill. | [Migration](../../supabase/migrations/20261027000000_store_tags_and_scoped_sessions.sql), [rollback-only verification](../../supabase/verification/store-tags-and-scoped-sessions.sql) (42 checks passed), and authenticated development-account receipt/session flows. |
| FR-11 — usual-store tags | Automatic tags require at least three purchases within the 180-day evidence window, use recency for ties, and update after completed sessions. Owners can set a manual tag, keep it through another purchase, and return it to automatic; a clear with no evidence leaves the item untagged. The list shows the tag and other-store summary. | [Usual-store spec](../../openspec/changes/store-tags-and-scoped-sessions/specs/usual-store-tags/spec.md), [base-list service](../../src/lib/server/services/base-lists.service.ts), [row](../../src/components/features/base-lists/items/base-list-item-row.tsx); signed-in UI flow and rollback-only SQL scenarios. |
| FR-12 — scoped sessions and per-list limit | A session can be scoped to a store, prioritizes matching items and folds other/untagged items, and counts a checked item when completed without a receipt. Two lists can be active concurrently; a second start for the same list resumes its active session. | [Session spec](../../openspec/changes/store-tags-and-scoped-sessions/specs/store-scoped-sessions/spec.md), [active-session spec](../../openspec/changes/store-tags-and-scoped-sessions/specs/active-session-limit/spec.md), [session service](../../src/lib/server/services/shopping-sessions.service.ts); signed-in browser scenarios and rollback-only SQL verification. |

The additive migration was applied on 2026-10-27 to the user-approved development Supabase project. Before and after counts matched: `base_list_items` 92, `shopping_sessions` 8, `shopping_session_items` 101, `tickets` 11, `stores` 0; one active session existed and no list had duplicate active sessions. The rollback-only SQL verification completed all 42 checks. The signed-in browser flow also uploaded the provided test receipt, confirmed OCR completion (18 items), and completed four store-scoped trips.

Known limits: no backfill for already-merged receipts; a trip completed with a receipt can count once as a trip and once as a receipt until the Phase 5 migration is applied; changing a receipt's store after its merge does not move prior statistics; collaborators do not see store tags or statistics. The full Playwright suite remains blocked by its global teardown, which resets all database rows; the browser scenarios were exercised manually in the authenticated development session instead.

### PRD v3 Phase 5: close the loop

| Requirement | Working-tree behavior | Evidence and validation |
| --- | --- | --- |
| FR-13 — receipt totals and trip reconciliation | OCR reads the printed total without another provider request. A read receipt can be reviewed against an active or recently completed trip; the owner can confirm matches, add selected lines as purchases, and attach once. Active attachment completes the trip; completed attachment refines prices without counting existing purchases again. Receipt and trip totals remain distinct; an optional confirmed total replaces the trip total. | [Change design](../../openspec/changes/close-the-loop/design.md), [migration](../../supabase/migrations/20261028000000_close_the_loop.sql), [rollback-only scenarios](../../supabase/verification/close-the-loop.sql), [receipt UI](../../src/components/features/tickets/attach/ticket-attach-card.tsx), and [v1 API](api-v1.md#compatibility-and-migration). The migration is applied to approved development project `listys`; all 34 rollback-only SQL checks pass. Both OCR Edge Functions are deployed there. Signed-in browser checks attached a receipt to an active trip and to a recently completed trip, verified totals, prices, attached state and no double-counted item. Automated Playwright E2E remains unrun because no local test Supabase environment is configured and its global teardown is table-wide. |
| FR-14 — price comparison by store | Owners can open the latest receipt-price records for a base-list item. The sheet compares unit prices only for compatible units, highlights the lowest comparable last receipt, and explains incomparable units. Collaborators receive no owner price rows. | [Store-price UI](../../src/components/features/base-lists/items/item-store-prices-sheet.tsx), [comparison helper](../../src/components/features/base-lists/items/helpers/compare-store-prices.ts), [migration](../../supabase/migrations/20261028000000_close_the_loop.sql), and [rollback-only scenarios](../../supabase/verification/close-the-loop.sql). Helper/component tests and database schema checks pass; signed-in browser validation compared actual Metro and Fortinos receipt prices. Automated store-price Playwright E2E remains unrun. |

Phase 5 verification: `pnpm typecheck`, `pnpm test:ci` (560/560), targeted ticket tests (65/65), targeted shopping-session tests (37/37), the native-props guard (8/8), and `pnpm verify:limits-reference` pass. The latest focused run of the base-list, shopping-session and attach-review tests passed 62/62; `pnpm typecheck` passed. `pnpm lint` reports 41 existing repository issues (23 errors and 18 warnings); the touched OCR `any` diagnostics are present at the same locations in `HEAD`. The additive migration was applied to approved development project `listys`; Phase 4 was present. Counts before and after matched: tickets 12, shopping_sessions 16, shopping_session_items 116, base_list_items 94, and base_list_item_store_stats 2. All 34 checks in the rollback-only SQL verification pass. Both OCR Edge Functions were deployed to the approved development project. The signed-in dashboard loads without browser-console errors. Browser validation attached a receipt to an active trip and a receipt uploaded before trip completion to a recent completed trip; it verified manual linking, paid totals, the attached state, no extra purchase for an already checked item, and the store-price sheet. The actual dashboard shell and Up Next pattern were visually compared with the canonical Design System v2 HTML served over localhost. A fixed-data visual fixture was also inspected at 320, 390 and 1280 px for the receipt summary, attached state, paid trip summary and item prices, history marker, review groups, and store-price sheet. It found and fixed a mobile grid overflow, desktop long-dialog height overflow, and 32px `Link…` targets; the revised dialog has no horizontal overflow and scrolls to its footer. Automated Playwright E2E was not run: `.env.test.local` is absent, and the configured global teardown still performs a table-wide reset. The focused verification for this turn passed 62/62 tests and `pnpm typecheck`.

Known limits: receipts merged or added to lists before this phase are not attached retroactively; an already completed trip at a different store cannot take the receipt; the running average remains approximate; a create-list/attach race can leave a newly created list while the receipt is attached; OCR totals are available only for receipts read after deployment of the changed Edge Function. A trip holds one receipt and an attached receipt cannot be detached. Price comparison uses the user's latest receipt history, not current or external prices.

| Area | Observed behavior | Evidence |
| --- | --- | --- |
| Authentication | Email/password registration/sign-in, Google OAuth, callback exchange, sign-out and protected layouts. Password reset links to an unimplemented route. | [`auth/`](../../src/app/auth/), [`auth-form.tsx`](../../src/components/features/auth/auth-form.tsx), [`proxy.ts`](../../src/proxy.ts) |
| Dashboard | Next-trip/active-session views, a flat "Shopping Lists" card (no group level), receipts, history, loading and error states. | [`dashboard/page.tsx`](../../src/app/(authenticated)/dashboard/page.tsx), [`build-dashboard-model.ts`](../../src/components/features/dashboard/helpers/build-dashboard-model.ts) |
| Lists | CRUD on one flat lists screen (groups are not shown), notes, quantities/categories/order and reusable shopping templates. Names are unique per user across all lists, ignoring case; lists that already shared a name read "Weekly", "Weekly (2)" on screen. A user with no list gets a default "Pantry" list in an implicit "My Lists" group on the first dashboard visit, and every list created without a group goes to that group (created on first use). The `/groups*` API remains for existing clients. | [`groups.service.ts`](../../src/lib/server/services/groups.service.ts), [`base-lists.service.ts`](../../src/lib/server/services/base-lists.service.ts), [`default-pantry.service.ts`](../../src/lib/server/services/default-pantry.service.ts) |
| Shopping | Owner starts a nonempty base list; items clone in purchase-count, recency, sort-order sequence. Check/edit/add/delete, complete with amount/notes (completion always applies the checked items to the base list, atomically), or cancel. The service checks for an existing active session. Base-list rows and the running session show average prices and an estimated total when known. | [`shopping-sessions.service.ts`](../../src/lib/server/services/shopping-sessions.service.ts), [`complete-session-rpc.ts`](../../src/lib/server/services/complete-session-rpc.ts), [`session-estimate.tsx`](../../src/components/features/shopping-sessions/session-estimate.tsx) |
| History | Completed sessions on one screen, newest first, filtered by list (`?list=`), totals and detail navigation. No service/action for creating a list from a completed session was found. | [`shopping-history/`](../../src/app/(authenticated)/shopping-history/), [`session service`](../../src/lib/server/services/shopping-sessions.service.ts) |
| Receipts | Multi-photo upload (photos only; the store is read by OCR), OCR, status/errors, manual retry, viewer/compare, selection, store confirmation, merge/create list (no group choice) with a Review Matches step that links lines to existing items, deletion with attempted image cleanup. No extracted-item editing endpoint was found. | [`tickets.service.ts`](../../src/lib/server/services/tickets.service.ts), [`tickets/`](../../src/components/features/tickets/) |
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
Protected pages: `/dashboard`, `/shopping-lists` (`/shopping-lists/{groupId}/lists` redirects to it),
`/base-lists/{baseListId}/edit`, `/shopping/{runId}`, `/shopping-history` (`/shopping-history/{groupId}` redirects to it),
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

Store name (PRD v3 Phase 3): both selected functions ask the **first photo's** request for the store name printed in
the header, in the same provider call as its items (no extra request), and accept the answer as the old item array or
as `{ "store_name", "items" }` ([`receipt-store.ts`](../../supabase/functions/_shared/receipt-store.ts), tested with
Vitest). The name is cleaned (one line, no control characters, at most 100 characters) and written to
`tickets.store_name` only when the receipt has none, so a name sent by an API client or read earlier is kept. A missing,
unreadable or malformed name never fails the receipt; it stays without a name. Deploying the functions is a manual step
(`supabase functions deploy process-ticket-ocr-gemini process-ticket-ocr-openai --use-api`, which bundles `_shared/` without
Docker). On 2026-10-26 both were deployed to the linked test project (Gemini version 26, OpenAI version 3, `verify_jwt` unchanged at
`true`). Checked the same day by uploading the repository's test receipt (`e2e/data-test/test-receipt.jpg`, a Metro receipt) through the
web app with the Gemini provider: read in 11 s, 18 items (the receipt's own count), `store_name` "metro" from the logo; the store card offered
"Save as New Store" with "Metro" proposed and saving confirmed it.

Deletion attempts Storage API removal before deleting the ticket. Storage errors are logged and do not prevent database
deletion, so orphaned images remain possible. The direct-storage deletion trigger was removed in the
[`20260215000002` migration](../../supabase/migrations/20260215000002_remove_storage_direct_access_trigger.sql).
The [API reference](api-v1.md) owns compatibility details; [limits](limits.md) owns values derived from code.

## PRD v2 acceptance gaps

| Requirement | Repository evidence and remaining verification |
| --- | --- |
| Review/edit extracted items | Review, selection and merge exist; editing OCR items is absent from the inspected UI/API. |
| History creates a base list with provenance | History/detail views exist; no `createBaseListFromSession` was found in actions or services. |
| Transactional completion and sync | Closed by PRD v3 Phase 1: `complete_shopping_session` completes the session and syncs the list in one transaction, so a failure leaves the session active ([`migration`](../../supabase/migrations/20261023000000_pantry_defaults_and_session_completion.sql)). Verified against the linked project with a rollback-only script, see below. |
| Idempotent merge and bounded automatic retries | Merge RPC/attempt fields do not establish request-level idempotency or exponential retries. Gemini checks a three-attempt cap; OpenAI increments attempts without the same cap, and the web retry service does not enforce it. See [`Gemini`](../../supabase/functions/process-ticket-ocr-gemini/index.ts), [`OpenAI`](../../supabase/functions/process-ticket-ocr-openai/index.ts) and [`retry service`](../../src/lib/server/services/tickets.service.ts). |
| Performance, retention, conversion and reliability targets | PRD goals remain targets; production measurements and telemetry were not verified. |

## PRD v3 Phase 1 delivered

[PRD v3](../prd/PRD-v3.md) Phase 1 is specified in the OpenSpec change `pantry-defaults-and-price-memory` and implemented as follows.

| Requirement | Observed behavior | Evidence |
| --- | --- | --- |
| FR-1 always sync | The completion sheet has no sync option; `POST /api/v1/shopping-sessions/{id}/complete` ignores `sync_to_base` and always applies checked items in one transaction, once per distinct item and trip. A repeated completion returns `409`; a full list skips the new items that do not fit and reports them; `PATCH` rejects `status: "completed"`. | [`complete-session-rpc.ts`](../../src/lib/server/services/complete-session-rpc.ts), [`complete-session-sheet.tsx`](../../src/components/features/shopping-sessions/complete-session-sheet.tsx), [`migration`](../../supabase/migrations/20261023000000_pantry_defaults_and_session_completion.sql), [API reference](api-v1.md#compatibility-and-migration) |
| FR-2 default Pantry | `ensure_default_pantry` creates the default group and "Pantry" once for a user who owns no list; it is awaited before the dashboard reads. A user with lists is untouched and gets no default group yet. | [`dashboard-content.tsx`](../../src/components/features/dashboard/dashboard-content.tsx), [`default-pantry.service.ts`](../../src/lib/server/services/default-pantry.service.ts) |
| FR-3 average price | Base-list and session rows show `average_price` when it is above zero; the running session shows an estimated total and how many items are priced. Nothing is written. | [`average-price.tsx`](../../src/components/features/list-items/average-price.tsx), [`session-estimate.tsx`](../../src/components/features/shopping-sessions/session-estimate.tsx), [`build-session-price-estimate.ts`](../../src/components/features/shopping-sessions/helpers/build-session-price-estimate.ts) |

Verification: the migration was applied to the linked Supabase project (a test project, with the user's approval) with
`supabase db query --linked`, because the remote migration history uses other versions for the shared-lists migrations and
`supabase db push` refuses to run until that history is repaired. The version `20261023000000` was recorded; the divergent
history was left as it was. [`pantry-and-session-completion.sql`](../../supabase/verification/pantry-and-session-completion.sql)
runs 29 checks inside a transaction that always rolls back (all passed). Not verified: two truly simultaneous first calls
(that guarantee rests on the partial unique index) and the Playwright specs (no validated local Supabase). The layouts were
checked in Chromium at 320, 390 and 1280 px with fixed fixtures on a temporary route (since deleted).

Signed-in check (2026-10-23, the owner's Google account, against the linked project, driven through Chrome over CDP with
`e2e/data-test/test-receipt.jpg`): the account already had lists, so no default group was created (as specified); the receipt
was uploaded and read (18 items); a list was created from it and then the receipt was merged into that list, after which all 18
rows showed their average price; a session started from the list showed "Estimated total · Based on 18 of 18 items with a known
price · $81.15", equal to the sum of the stored averages; the completion sheet had no sync option; completing with 3 of 18
items checked left those 3 at `purchase_count` 3 and the other 15 at 2, with the session `completed` and `sync_to_base` true;
repeating `/complete` returned `409` and `PATCH` with `status: "completed"` returned `422`.

Second signed-in check, with a brand-new account without lists (same day): the first dashboard load created exactly one default
group "My Lists" and one empty "Pantry" (hero "Add Items", Start disabled, empty list with a next step); three reloads and six
parallel dashboard renders created nothing more. Items added by hand showed no price and no `$0`; a session from a priced-less list
showed no estimate card. Completing a trip with an item added mid-trip added it to the list as new (`purchase_count` 1) and raised
the checked ones. After merging the receipt into the Pantry (22 items, 18 priced) a session showed "Based on 18 of 22 items with a
known price · $81.15", then "19 of 23 · $86.14" after adding an item with the name of a priced one. Completing with two session
items of the same name checked counted one purchase (1 to 2, not 3) and kept the list at 22 items. A finished session shows no
estimate and no prices. No horizontal scroll at 320 and 390 px (rows 64 px in the list, 68 px in a session), and the price rows and
the estimate card read correctly in dark mode. After deleting the Pantry and reloading, it was not recreated (the dashboard shows
"Start with a receipt" and the default group remains). The skipped-items toast was checked by simulating only the `/complete`
response (`over_limit_count: 2`); the database side of a full list is covered by the rollback-only script. Not exercised: two truly
simultaneous first sign-ins and the collaborator view of a shared session.

Known limits introduced or exposed by this phase:

- `average_price` is a running mean weighted by `purchase_count`, and `purchase_count` also grows for purchases without a price, so an
  item bought several times without price and later with one shows a low average. The estimate adds averages without multiplying by
  the session quantity. A purchases-with-price counter would fix the first; both are open questions in the change design.
- Creating a new list from a receipt does not copy the receipt prices into `average_price` (only merging a receipt into an
  existing list does), so a list created that way shows no prices until a receipt is merged into it. This predates Phase 1 and
  limits how soon FR-3 becomes visible; copying the prices on creation is a candidate follow-up.
- Accounts that already had lists have no default group. Resolved in Phase 2: `ensure_default_group` creates it the first time a list is created without a group.
- The default group occupies one of the ten group slots ([limits](limits.md)).
- Direct `GET /api/v1/shopping-sessions/{id}` still returns database rows; the estimate is computed by the page, not the API.

## PRD v3 Phase 2 delivered

[PRD v3](../prd/PRD-v3.md) Phase 2 (flat lists) is specified in the OpenSpec change `flat-lists-hide-groups`. Groups still exist in the
database and in the `/groups*` API; the web app no longer shows, asks for or creates them.

| Requirement | Observed behavior | Evidence |
| --- | --- | --- |
| FR-4 groups removed from the UI | `/shopping-lists` shows every list of the account in one grid; creating a list, creating one from a receipt and merging a receipt never ask for a group (the merge sheet has one list selector, or only a name when there is no list). A list created without a group goes to the user's default group, which `ensure_default_group` creates on first use, so accounts that already had lists need no backfill. List names are unique per user, ignoring case and treating `%`/`_` literally; older lists that share a name read "Weekly", "Weekly (2)" on screen and keep their stored name. `/shopping-lists/{groupId}/lists` redirects to the lists screen. The menu counts lists, the marketing page no longer promises groups, and no group or list was deleted, moved or renamed. | [`shopping-lists/page.tsx`](../../src/app/(authenticated)/shopping-lists/page.tsx), [`default-group.service.ts`](../../src/lib/server/services/default-group.service.ts), [`find-list-by-name.ts`](../../src/lib/server/services/find-list-by-name.ts), [`build-list-display-names.ts`](../../src/utils/build-list-display-names.ts), [`merge-to-base-list-dialog.tsx`](../../src/components/features/tickets/add-to-list/merge-to-base-list-dialog.tsx), [`migration`](../../supabase/migrations/20261024000000_ensure_default_group.sql) |
| FR-5 history by list | `/shopping-history` is one screen of completed trips, newest first, with a "Show trips from" select (lists that have trips, plus "All lists") backed by `?list=`; an unknown value reads as all lists. `/shopping-history/{groupId}` redirects to it. The session page goes back to the history (keeping the list) or to the lists, and still understands the old `from=history-group` origin. | [`shopping-history/page.tsx`](../../src/app/(authenticated)/shopping-history/page.tsx), [`build-history-view.ts`](../../src/components/features/shopping-sessions/helpers/build-history-view.ts), [`resolve-session-back-link.ts`](../../src/components/features/shopping-sessions/helpers/resolve-session-back-link.ts) |
| FR-6 dashboard without group counts | The model has no group count or group names; the "Shopping Lists" card lists up to five lists flat with item count and Start, with "+ N more" to the lists screen. The dashboard no longer reads `/groups`. | [`build-dashboard-model.ts`](../../src/components/features/dashboard/helpers/build-dashboard-model.ts), [`lists-section-card.tsx`](../../src/components/features/dashboard/lists-section-card.tsx) |

API v1 (compatible, see [API v1](api-v1.md#compatibility-and-migration)): `group_id` optional on list creation and on create-from-receipt; a supplied
`group_id` must be the caller's (`404`; the database did not check it before); `GET /base-lists` adds `notes` and `created_at`; the duplicate-name
`409` now applies across the account.

Verification (2026-10-24): `pnpm typecheck` clean; `pnpm lint` reports 40 problems, the same count as before this phase and none in a file this
change touches; `pnpm verify:limits-reference` passes; `pnpm test:ci` ran 583 tests with 582 passing, the one failure being the known stale
allowlist entry in `src/test/native-props-guard.test.ts` (`session-bar.tsx`), unrelated. The migration was applied to the linked test project with the
user's approval (counts before and after identical: 7 groups, 11 lists, 8 sessions, 1 default group; only its own version was recorded) and
[`flat-lists-default-group.sql`](../../supabase/verification/flat-lists-default-group.sql) ran inside a transaction that always rolls back: 18/18 checks passed
(an account with lists and no default group gets exactly one, repeats return the same one, `ensure_default_pantry` is unaffected, RLS, anonymous and invalid names).
The layouts were checked in Chromium at 320, 390 and 1280 px on a temporary public route with fixed fixtures that never contacted Supabase (route deleted
afterwards): no horizontal scroll in any of the nine views (flat lists with two same-named lists and a long title, empty lists, the dashboard with and without
lists, the merge sheet with and without lists, the history with, without and narrowed by a filter); the filter is 44px high; the Start button in the
dashboard card is 32px; no group wording in the app text.
Not verified: dark mode, a signed-in session against real data (a list created on an account that has lists but no default group through the web UI, the
redirects for foreign group ids, the history filter on real trips) and the E2E specs, which were updated but not run (no validated local Supabase). Two truly
simultaneous first list creations rest on the partial unique index.

Signed-in check (2026-10-24, the owner's account on the linked test project, driven through Chrome over CDP at 1280 px): the account had one group ("Walmart", not default) with 3 lists and no default group. Creating a list from the UI asked only for a name (the sheet has a name and notes, nothing else), opened the editor ("Back to Lists") and created exactly one default group "My Lists" holding it; "Walmart" and its 3 lists were untouched. Creating "fase2 test a" (other case) and "weekly grocery" (a list in "Walmart") was refused with "A list with this name already exists. Please choose a different name."; "Fase2 %" was created (no wildcard match); renaming "Fase2 Test A" to "FASE2 TEST A" was accepted. The lists screen, the dashboard, the history and the receipts screen contain no group wording; the menu entry read "Shopping Lists" with a "5" pill labelled "5 lists"; the old group URLs ended on `/shopping-lists` and `/shopping-history`. The history filter offered "All lists" plus the two lists with trips, narrowed to one trip with `?list=<id>`, the trip's back link returned to the same filter, "All lists" cleared it, and an unknown `list` value showed all trips. On a receipt, "Add to a List" opened a sheet with no group selector and one selector with all five lists; a repeated name in "Create new list" was refused with "You already have a list with this name. Choose another name."; creating "Fase2 From Receipt" with only a name made a list of 2 items in "My Lists" and linked the receipt to it (no second default group). The three test lists were deleted afterwards; the default group "My Lists" (empty) and the receipt's group link remain on the test account. Not checked: the duplicate-name twin case of legacy lists, mobile widths on the live account, dark mode and the E2E specs.

Known limits introduced or exposed by this phase:

- Same-named lists made before this phase are kept and only disambiguated on screen; names are unique per account only through application checks (read, then write), so two simultaneous creations with one name can still produce a twin.
  A database constraint needs a product decision on those twins first.
- The lists screen and the history are unpaginated; the history now joins what used to be split by group.
- Deleting a list also deletes its shopping sessions (existing `ON DELETE CASCADE`), which removes those trips from the history. The confirmation says it removes the items and the sharing, not the trips.
- The lists screen reads only the owner's lists, so people a list was shared with do not see it there (experimental sharing, unchanged).
- The HTML design reference still draws group screens and has no history filter ([DESIGN.md §11.4](../design/DESIGN.md#114-current-implementation-gaps) items 12c).
- PRD v3 open question 4 is decided as "keep names, hide the group": no prefix is added and no group name is shown.

## PRD v3 Phase 3 delivered

[PRD v3](../prd/PRD-v3.md) Phase 3 (stores foundation) is specified in the OpenSpec change `stores-foundation`.

| Requirement | Observed behavior | Evidence |
| --- | --- | --- |
| FR-7 store extraction | The upload sheet asks for photos only. The Gemini and OpenAI OCR functions ask the first photo's request for the header's store name (no extra provider request), accept the old item array or `{ store_name, items }`, clean the name and write `tickets.store_name` only when the receipt has none; a missing or malformed name never fails the receipt. `store_name` on upload stays optional and is validated (≤ 100). | [`receipt-store.ts`](../../supabase/functions/_shared/receipt-store.ts), [Gemini](../../supabase/functions/process-ticket-ocr-gemini/index.ts), [OpenAI](../../supabase/functions/process-ticket-ocr-openai/index.ts), [`upload-ticket-form.tsx`](../../src/components/features/tickets/upload/upload-ticket-form.tsx) |
| FR-8 My Stores | `stores` and `store_aliases` are owner-only (RLS), names are normalized (case, accents, spaces, punctuation, `#123` and trailing 3+ digit branch numbers ignored) and every key resolves to one store. On a read receipt the store card proposes the matching store (one-tap `Confirm`), saves an unknown name as a new store or lets the user choose one; assigning a store teaches the raw name as its alias; it is optional. Receipts reference `store_id` (composite FK to a store of the same user). `/stores` lists stores with receipt counts and renames (the old name stays an alias) and merges them (receipts and names move, the source is removed, in one transaction). Receipt titles use the confirmed store. | [`stores.service.ts`](../../src/lib/server/services/stores.service.ts), [`ticket-store-card.tsx`](../../src/components/features/tickets/receipt/ticket-store-card.tsx), [`stores-list.tsx`](../../src/components/features/stores/stores-list.tsx), [`receipt-store-label.ts`](../../src/utils/receipt-store-label.ts), [migration](../../supabase/migrations/20261025000000_stores_foundation.sql) |
| FR-9 cross-store item matching | Adding receipt lines to an existing list first reads `GET /tickets/{id}/matches`; when a line is new or matched by a remembered link, the sheet shows Review Matches, where a new line can be linked to an item of the list (search over the list's items) and a remembered match can be changed or undone. The merge applies the links, remembers them per list (`base_list_item_aliases`) and counts only created items against the list limit, in one transaction; a later receipt shows the remembered match before applying it. | [`merge-review.ts`](../../src/components/features/tickets/add-to-list/helpers/merge-review.ts), [`merge-review-step.tsx`](../../src/components/features/tickets/add-to-list/merge-review-step.tsx), [`tickets.service.ts`](../../src/lib/server/services/tickets.service.ts) |

API v1 (compatible, see [API v1](api-v1.md#compatibility-and-migration)): new `/stores`, `/stores/{id}`, `/stores/{id}/merge` and
`/tickets/{id}/matches`; `store_id` on `PATCH /tickets/{id}`; optional `links` on `merge-to-base-list`; receipt reads add `store` and
`store_suggestion`; merge errors are mapped (`404`, `422`, `409 LIMIT_EXCEEDED`) instead of a raw `500`.

Verification (2026-10-25/26): the migration was applied to the linked test project with the user's approval (counts before and after identical:
11 tickets, 242 ticket items, 92 list items, 11 lists, 8 sessions, 8 groups; only its own version recorded; one merge function, no overload) and
[`stores-foundation.sql`](../../supabase/verification/stores-foundation.sql) ran inside a transaction that always rolls back: 70/70 checks passed
(normalization, create/duplicate/limit, rename, alias learning and re-pointing, merge, RLS and the composite FK, matching, links, alias undo and
re-link, limit counting, anonymous calls). `pnpm test:ci` 449/449, `pnpm check:native-props`, `pnpm verify:limits-reference` and `pnpm typecheck`
pass; `pnpm lint` reports 41 problems, all pre-existing and none on lines of this change. Layouts were measured in Chrome at 320, 390 and 1280 px on a
temporary public route with fixed fixtures and stubbed API reads (deleted afterwards): no horizontal scroll at any width; store-card buttons 40px on
phones and 44px from `md`; card menus 44×44; picker search 44px and rows 48px; Review Matches fits 320px, linking a line updates its row.
Signed-in check (2026-10-26, the owner's account on the linked test project, Chrome at a 376–416 px phone width, user's approval): with no store at
first, "Save as New Store", choosing a store (the raw name then suggests it), one-tap Confirm, the picker's Create row (a variant of an existing name
reuses that store), Remove Store, adding items without a store ("Create new list" made "Fase3 Test"), same-name lines added without review, and
renaming (old name keeps suggesting; a taken name offers to merge) and merging stores (receipts and names move) all behaved as specified, with no
console errors and only the expected `409`s. It found five defects, fixed the same day and re-checked in that session: (1) confirming "Link to This
Item" also submitted the Add Items sheet (React bubbles `submit` through portals), so links were never sent; now the link is applied, the linked item
counts the purchase and price, no item is created, the next receipt shows the remembered match, and "Add as New" creates the item instead; (2) a list
created from a receipt did not keep the lines' prices (older defect), now it starts each item's average price; (3) the store card and the My Stores
sheets showed the old state with live buttons for about 3 s while the page refreshed, now they stay busy until the refresh is drawn; (4) reusing an
existing store said "Store saved" and the picker offered to create variants of existing names, now it says the store was already there and matches
names the way the database does; (5) the selection bar's buttons were 32px (older defect), now `primary` (40px on phones). Test data left on that
account: the store "Fase3 Tienda A" with its aliases and three receipts, and the list "Fase3 Test" with six items.
Visual check (2026-10-26, same session, phone 376 px and desktop 1568 px, against the v2 HTML served locally): the My Stores cards match the Lists
cards (24px radius, 36px tile, title, 44px menu, mono count; their footer is shorter because a store has no link); the store card sits in the
receipt's right column on desktop with the photo card's header pattern; the picker, the store name sheet and Review Matches are A1 sheets like the
other forms, matching the v2 card and dialog sections; the sidebar highlights "My Stores" and the breadcrumb reads "Management › My Stores". One
defect found and fixed: with only the current store, the picker said "No store matches this search." before any search; it now says there are no
other stores and that a name can be typed. Dark mode was left out by the user's decision.
Not verified: the `unrecognized` state with real data (no receipt without a raw name). The OpenAI function is deployed with the same change but
out of scope: the product works with Gemini only for now (owner's decision, 2026-10-26) (not deployed: the running functions still behave as before, so new receipts arrive
without a store name until they are), and the E2E specs, written but not run (no validated local Supabase).

Known limits introduced by this phase:

- No automatic or fuzzy suggestions: a differently named line is linked by hand once per list.
- Stores cannot be deleted or split; a mistaken merge is undone only by renaming and reassigning receipts.
- Restoring a deleted list item (`Undo`) creates a new item, so its remembered links are gone.
- "Save as New Store" creates the store, then assigns it: if the second call fails, the store exists without the receipt and the card offers to retry the assignment.
- The picker can only hide a "Create" row for names it can see; a name that is only another store's alias is still offered, and the server then reuses that store.
- Branch numbers of 1–2 digits at the end of a name are kept ("Shop 24"), so such variants need an alias once.
- The design reference has no store screens; the derived designs need review ([DESIGN.md §11.4](../design/DESIGN.md#114-current-implementation-gaps) item 12d).

## Audit findings and follow-up

These are remaining application/operational tasks; the documentation update does not fix them.

| Priority | Finding | Evidence and next action |
| --- | --- | --- |
| Critical | E2E cleanup deletes table-wide data; credentials do not use required `E2E_SUPABASE_*` inputs. | [`db-reset.ts`](../../e2e/helpers/db-reset.ts), [`global-teardown.ts`](../../e2e/global-teardown.ts), [`supabase-client.ts`](../../e2e/helpers/supabase-client.ts). Replace broad resets with fixture-scoped cleanup and align credentials before running suites. |
| High | Several APIs return selected database rows; collections lack pagination metadata/links; write schemas generally strip unknown fields. | [`http.ts`](../../src/lib/api/http.ts), [`group service`](../../src/lib/server/services/groups.service.ts), [`base-list service`](../../src/lib/server/services/base-lists.service.ts), [`group schemas`](../../src/lib/validations/group.ts). Add DTOs and bounded contracts to meet AGENTS.md. |
| High | Unexpected errors can expose `error.message`; services often include database messages. | [`http.ts`](../../src/lib/api/http.ts). Sanitize outward errors and add safe structured server logs. Request IDs alone are not a complete observability system. |
| High | No complete OpenAPI/equivalent response schema, request idempotency/conditional-update mechanism or application rate-limit implementation was found. | [`API reference`](api-v1.md), [`handlers`](../../src/app/api/v1/), [`helpers`](../../src/lib/api/). Treat these as follow-up requirements. |
| High | Session cloning and invite use-count updates involve separate writes (completion and sync are now one transaction). | [`session service`](../../src/lib/server/services/shopping-sessions.service.ts), [`sharing service`](../../src/lib/server/services/sharing.service.ts). Verify concurrency/failure recovery before claiming atomicity. |
| High | Server Actions and HTTP services duplicate domain implementations instead of consistently sharing one service layer. | [`actions/`](../../src/actions/), [`services/`](../../src/lib/server/services/). Consolidate behavior or verify both paths when fixing validation, authorization and business rules. |
| Medium | Three deprecated v1 aliases still advertise the already-passed 2026-09-30 sunset. | [Compatibility inventory](api-v1.md#compatibility-and-migration). Agree the migration/removal plan before changing routes or dates. |
| Medium | Password reset and two PRD journeys remain incomplete; production SLOs are unverified. | Acceptance gaps above and [design gaps](../design/DESIGN.md#114-current-implementation-gaps). |
| Medium | No tracked CI workflows; release ownership, alert configuration, backup verification and retention decisions remain unestablished. | [Deploy](../runbooks/deploy.md), [incidents](../runbooks/incidents.md), and [privacy](../privacy/taste-profile.md) record open questions. |

## Audit boundaries

Substantial application and design-document edits existed before the review. Findings describe that working tree;
unrelated changes were preserved. No remote data, migrations, destructive maintenance, E2E cleanup, production
deployments or provider calls were executed for this audit.
