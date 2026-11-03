# Tasks

## 0. Prerequisite

- [x] 0.1 Confirm `clarify-receipt-review` is archived (its requirements appear in `openspec/specs/trip-receipts` and `openspec/specs/receipt-session-reconciliation`); if not, stop and ask the user to archive it first, since this change modifies requirements it adds

## 1. Database: no window, purchased quantity

- [x] 1.1 Add migration `supabase/migrations/<timestamp>_trips_receipt_attach.sql` with a non-destructive review header and a prerequisite check for `clarify_receipt_review`; `CREATE OR REPLACE` `ticket_session_candidates` from the clarify body without the window condition; verify with a diff against that body that only the window line changed
- [x] 1.2 In the same migration, `CREATE OR REPLACE` `attach_receipt_to_session` from the close-the-loop body: drop the `SESSION_OUT_OF_WINDOW` check and set each matched session item's `quantity`/`unit` to the summed line quantity when its lines share one unit, updating the matching `base_list_items` row too for a completed session (design decision 8); verify with a diff that nothing else changed and by reading that the migration has no `DELETE`, `UPDATE` outside function bodies, `DROP`, `TRUNCATE` or backfill
- [x] 1.3 Add `supabase/verification/trips-receipt-attach.sql` covering: more than usual → replaced, less than usual → replaced, two lines → summed, active session completed by the receipt takes the receipt quantity, checked item without a line unchanged, mixed units unchanged, old completed session attaches and does not add a purchase, candidates include an old origin trip; verify it runs as a transaction that rolls back

## 2. Server: origin rule and available receipts

- [x] 2.1 In `attachTicketToSession`, reject with `RECEIPT_NOT_FROM_TRIP` only when `uploaded_from_session_id` is set and differs; update `attach-to-session-route.test.ts` (no origin → RPC called; other origin → 409 without RPC) and verify with `pnpm test`
- [x] 2.2 Add `listAvailableReceipts(sessionId)` to `shopping-sessions.service.ts` per design decision 5 (owner session check → `404`; filters, order, limit 50; `selectable`/`reason: 'STORE_MISMATCH'`) and the Zod-validated `GET /api/v1/shopping-sessions/[sessionId]/available-receipts` route; add `available-receipts-route.test.ts` for: another user's session 404, filters (pending, attached, added to list, other origin excluded; own origin included), store mismatch flagged, invalid id 400
- [x] 2.3 Add the client endpoint in `src/lib/api/endpoints/shopping-sessions.ts` with its DTO type and document the route in `docs/reference/api-v1.md`; verify `pnpm typecheck`

## 3. Trips section

- [x] 3.1 Move the page to `src/app/(authenticated)/trips/page.tsx` with title "Trips", copy without "history", and links with `from=trips`; turn `shopping-history/page.tsx` into a `permanentRedirect` to `/trips` forwarding `list`, and point `shopping-history/[groupId]` to `/trips`; verify by a unit test of the `list` forwarding helper (or the redirect target builder)
- [x] 3.2 Update `resolveSessionBackLink` to accept `trips` plus legacy `history`/`history-group` with href `/trips` and label "Back to Trips"; update `resolve-session-back-link.test.ts` and `shopping-run-page.test.ts`
- [x] 3.3 Rename the nav entries to "Trips" at `/trips` in `nav.ts` (sidebar and `MOBILE_TAB_ITEMS`) and update the dashboard links (`build-dashboard-model.ts`, `month-spending-card.tsx`); verify with `rg "shopping-history|Shopping History|'History'" src` returning only the redirect pages and legacy back-link handling, and that dashboard tests pass
- [x] 3.4 Add each trip's receipt to `getShoppingHistory` with a second owner-scoped query (design decision 2); verify with a test in `shopping-sessions/tests/` that a trip with a ticket gets `receipt` and one without gets `null`
- [x] 3.5 `HistorySessionCard`: `Completed` badge, `Receipt attached` / `No receipt` badge, and an `Add Receipt` primary link to `/shopping/{id}?from=trips&receipt=add` only without receipt; add a component test in `shopping-sessions/tests/` proving the action shows only without receipt
- [x] 3.6 Update `e2e/` specs that visit `/shopping-history` or assert "Shopping History" to the new route and copy; verify they type-check

## 4. Trip page receipt states

- [x] 4.1 Extract the Realtime + poll status logic of `TicketStatusListener` into `useTicketStatus` in `tickets/receipt/hooks/` and use it in the listener; verify the receipt page behavior is unchanged with existing tests and a hook unit test for terminal-status refresh
- [x] 4.2 Add a pure `getTripReceiptState` helper (attached / none / reading / read / failed from the session receipt and the latest pending origin ticket) with a unit test, and load the latest pending origin ticket in `shopping/[runId]/page.tsx` with one owner-scoped query
- [x] 4.3 Header shows `Completed` and, without receipt, a `No receipt` badge; `TripReceiptsCard` renders the `none`/`reading`/`read`/`failed` states per design decision 3, drops the 48-hour note and the "one per store" copy, and offers actions only to the owner; add a component test in `shopping-sessions/tests/` for which action each state shows
- [x] 4.4 `Add Receipt` opens an A1 sheet with `Upload New Receipt` and `Choose Uploaded Receipt`; `receipt=add` opens it on load; on `saved=1` the card shows `Choose Uploaded Receipt` only when the available list is non-empty; verify with a component test
- [x] 4.5 `UploadTicketForm` stays on the page when `shoppingSessionId` is set (no push to the receipt) and the toast says it is being read; extend the upload form test for both cases

## 5. Choosing and reviewing a receipt from the trip

- [x] 5.1 `ChooseUploadedReceiptSheet` in `features/shopping-sessions/` loading `available-receipts` on open (loading, error with retry, empty state with `Upload New Receipt`), radio rows with store, date, total and line count, disabled rows with the store-mismatch reason; derive from the `StorePickerDialog` pattern and add `data-testid`s; component test for selectable vs disabled rows and the empty state
- [x] 5.2 Split the review out of `useAttachToSession` into `useTripReview({ ticketId, session })` (loads ticket, matches, session items; owns links, added lines, total, submit) and make `useAttachToSession` delegate to it; verify `attach-review` tests and the receipt-page attach flow still pass
- [x] 5.3 `AttachToSessionDialog` shows "Review how this receipt will update the trip" only once ticket and matches are loaded and a status line while loading; Cancel sends nothing; success refreshes the trip page or pushes to the trip from the receipt page; add a component test for the description timing and that Cancel makes no request
- [x] 5.4 Wire the trip page: `Review Receipt` (read state) and choosing an uploaded receipt open the dialog with the trip as the fixed session; verify with a component test that choosing a receipt opens the review for it
- [x] 5.5 Update `e2e/ui/receipt-attach.e2e.spec.ts`: from a completed trip, choose a standalone read receipt, cancel (trip still "No receipt"), then confirm (trip shows the receipt summary and Trips shows "Receipt attached"); verify it type-checks
- [x] 5.6 Update `docs/design/DESIGN.md`: "Close the loop" (no window, chooser from the trip, trip card states, review timing, quantity rule), 7.11 navigation ("Trips") and 11.6 (trip card with receipt status and `Add Receipt`); verify it matches the delta specs and names the v2 patterns used

## 6. Visual validation

- [x] 6.1 Build a temporary fixture route (per project memory: stubbed Supabase, fake auth cookie) with Trips cards with and without receipt, the trip card in each state, the Add Receipt sheet, the chooser (selectable, disabled, empty) and the review loading/ready; check at 390px and 1280px with Chrome DevTools against `docs/design/listys-design-system-v2.html` (cards, badges, sheets, radio rows), fix discrepancies, then delete the route

## 7. Integration checks

- [x] 7.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm check:native-props`; all pass
- [x] 7.2 Ask the user before running the migration, the SQL verification and the Playwright specs against a Supabase project; record the result or that it was not run Result (2026-11-03, user approved the linked project `listys`, which the CLI labels production): migration `20261103000000_trips_receipt_attach.sql` applied alone and recorded with `migration repair` (no `db push`); `supabase/verification/trips-receipt-attach.sql` passes 18/18, `close-the-loop.sql` 34/34 (its stale 48-hour candidates check now asserts the origin-only rule) and `clarify-receipt-review.sql` 9/9, each rolling back with no leftover rows. The Playwright specs were not run: E2E only accepts a loopback Supabase and none is available here.
- [x] 7.3 Run `openspec validate trips-and-receipt-attach --strict` and fix any reported issue

## Workflow follow-up

- Archive the change after review with `/opsx:archive`, after `clarify-receipt-review` has been archived.
