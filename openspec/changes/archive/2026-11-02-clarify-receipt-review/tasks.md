# Tasks

## 1. Database: quantity rule and upload origin

- [x] 1.1 Add migration `supabase/migrations/20261102000000_clarify_receipt_review.sql`: non-destructive review header, prerequisite check for `close_the_loop`, nullable `tickets.uploaded_from_session_id` with composite FK `(uploaded_from_session_id, user_id) → shopping_sessions(id, user_id) ON DELETE SET NULL (uploaded_from_session_id)`; verify by reading the migration that it contains no `DELETE`, `UPDATE`, `DROP`, `TRUNCATE` or backfill
- [x] 1.2 In the same migration, `CREATE OR REPLACE` `merge_ticket_items_to_base_list` copied from the latest body with only the update branch changed to `quantity = COALESCE(base_list_items.quantity, rec.quantity, 1)`; verify with a diff against the `close_the_loop` body that nothing else changed
- [x] 1.3 In the same migration, `CREATE OR REPLACE` `ticket_session_candidates` so it returns only `tickets.uploaded_from_session_id` when it is still a candidate (none without origin); verify with the diff that the window, attached and ownership filters are unchanged
- [x] 1.4 Add `supabase/verification/clarify-receipt-review.sql` covering: existing item keeps quantity, item without quantity takes the line's, new item takes the line's, store stats record the line quantity, candidates empty without origin, candidates limited to origin, origin cleared when its session is deleted; verify the script reads as a transaction that rolls back
- [x] 1.5 Regenerate or hand-update `src/types/database.types.ts` for the new column and verify `pnpm typecheck` passes

## 2. Server: upload origin and attach guard

- [x] 2.1 Add optional `shopping_session_id` (UUID) to `uploadTicketFieldsSchema` in `src/lib/validations/ticket.ts` and extend `src/lib/validations/tests/ticket.test.ts` (valid UUID accepted, missing allowed, malformed rejected); verify with `pnpm test`
- [x] 2.2 In `uploadTicket` (`tickets.service.ts`), when `shopping_session_id` is present, check the session exists for `user.id` before any storage upload and throw `404` otherwise; insert `uploaded_from_session_id`; extend `src/app/api/v1/tickets/tests/upload-route.test.ts` for: origin saved, another user's session → 404 with no storage upload, no field → no origin
- [x] 2.3 In `attachTicketToSession`, read the ticket's `uploaded_from_session_id` and throw `409 CONFLICT` with `details.reason = 'RECEIPT_NOT_FROM_TRIP'` when null or different from the payload session; extend `attach-to-session-route.test.ts` for both cases and verify the RPC is not called
- [x] 2.4 Expose `uploaded_from_session_id` (as `uploaded_from_session: { id } | null` or the raw id, matching the existing ticket DTO style) from `getTicket`, and verify `session-candidates-route.test.ts` and `src/lib/api/endpoints/tests/tickets.test.ts` still pass

## 3. Upload from a trip

- [x] 3.1 Add an optional `shoppingSessionId` prop to `UploadTicketDialog` and `UploadTicketForm`, appended as a `shopping_session_id` form field only when set; verify the form test (or a new one in `upload/tests/`) asserts the field is sent only with the prop
- [x] 3.2 Pass the trip's session id from `TripReceiptsCard` (and its caller in the shopping session page) to `UploadTicketDialog`; verify by reading that no other `UploadTicketDialog` usage passes it

## 4. Receipt screen: attach card only for the origin trip

- [x] 4.1 In `src/app/(authenticated)/tickets/[ticketId]/page.tsx`, render `TicketAttachCard` and `ReceiptAddedToListNote` only when the ticket has an upload origin; update `shouldShowAttachCard`/its test in `tickets/tests/` for the origin condition
- [x] 4.2 Remove the multi-candidate chooser from `AttachToSessionDialog`/`useAttachToSession` (open the review with the single candidate), delete `sortCandidatesByStore` and the multi-candidate branch of `getAttachDialogStage`, and update or remove `attach-candidates.test.ts` and `attach-review.test.ts`; verify `pnpm test` and `pnpm lint` pass with no unused exports left
- [x] 4.3 Update `e2e/ui/receipt-attach.e2e.spec.ts`: a receipt uploaded from the trip card shows `ticket-attach-card`; a receipt uploaded from Receipts does not; verify it type-checks (running E2E needs local Supabase, see 9.2)
- [x] 4.4 Update the "Close the loop" paragraph in `docs/design/DESIGN.md` (origin-only offer, no chooser, active trips have no UI entry point) and verify it matches the delta spec

## 5. Triage model with decisions

- [x] 5.1 Rewrite `buildReceiptTriage(items, matches, decisions)` per design decision 2 (badges, proposal, resolved outcome, section, categories via `groupByCategory`) and update `receiptBulkSelectionIds`; rewrite `receipt/tests/build-receipt-triage.test.ts` for: badges per case, both badges, resolved link → matched, resolved new → fresh, resolved without price stays in check, category order and receipt order inside, empty sections hidden, matched folded only with other sections
- [x] 5.2 Add `useReceiptDecisions` in `receipt/hooks/` (decide returns previous value, clears when the target list id changes) with its pure state helper and a unit test for decide/undo/reset; update the `receipt/hooks` barrel if one exists
- [x] 5.3 Add the `switching` status to `receiptTriageReducer`, make `receiptItemsView` keep the triage view for it, and make `retry` retry the last requested list; extend `receipt/tests/receipt-triage-state.test.ts` for switching and retry-after-switch

## 6. Receipt screen UI

- [x] 6.1 Target row in `ticket-items-list.tsx`: "Add to" label bound to the select and the note "Each line is compared with this list."; render the "Comparing with <list>…" status card in place of the sections while switching (with `data-testid='receipt-triage-switching'`)
- [x] 6.2 Status sections render their categories as caption rows (icon, name, count) inside the section's `CategorySection`; extract the caption to a shared presentational component if the category view reuses it
- [x] 6.3 `TicketItemRow`: badges ("In list", "New", "Confirm match", "No price"), pending proposal ("Possible match: <item>", `Confirm Match`, `Choose Another`, `Add as New`), resolved outcome ("Matches <item>" / "Adds as new item", `Change`), actions outside the `<label>`; checkbox aria-label "Include <name>"; category header "Include all items" / "N of M included"
- [x] 6.4 Wire decisions in `TicketReview`: `Choose Another` opens `LinkItemDialog` over the target list's items (loaded once per list), each decision shows a sonner toast with `Undo` restoring the previous decision; pass decisions to `TicketItemsList` and the compare dialog
- [x] 6.5 `Include All N` / `N included` / `Undo` copy in the matched section
- [x] 6.6 `TicketSelectionBar`: "N included", total plus "N new · M updated" when a breakdown is given, button "Add or Update"; compute the breakdown in `TicketReview` from selected lines and decisions with a small pure helper covered by a unit test
- [x] 6.7 Add a component test in `receipt/tests/` proving the wiring: confirming a proposal moves the line out of "Needs a look", updates both counters, does not change inclusion, and Undo restores it; verify with `pnpm test`
- [x] 6.8 Update the receipt triage note in `docs/design/DESIGN.md` 7.6 (target row copy, badges, proposal row, Change/Undo, nested categories, switching card, Include copy) and verify it names the v2 patterns used

## 7. Add dialog

- [x] 7.1 `MergeToBaseListDialog`: title "Add or Update Items" and description that new products are added and existing ones are updated keeping their quantity; Review Matches outcome copy for updated items unchanged otherwise
- [x] 7.2 Add `initialDecisions` to the dialog and seed `useMergeReview.load` only when the dialog's list equals `initialDecisions.baseListId`, keeping decisions only for suggested/fresh/remembered lines; extend `add-to-list/tests/merge-review.test.ts` (seeded links match screen decisions; another list ignores them) and verify `merge-review-step.test.ts` still passes
- [x] 7.3 Pass `{ baseListId, decisions }` from `TicketReview` to the dialog and clear decisions together with the selection on merge success

## 8. Visual validation

- [x] 8.1 Build a temporary fixture route (per project memory: stubbed Supabase, fake auth cookie) with a receipt covering every badge, a proposal, a resolved line with Change, nested categories, the switching card and the bar breakdown; check at 390px and 1280px with Chrome DevTools against `docs/design/listys-design-system.html` (review rows, badges, category sections), fix discrepancies, then delete the route

## 9. Integration checks

- [x] 9.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm check:native-props`; all pass
- [x] 9.2 Ask the user before running the migration, the SQL verification and `npx playwright test e2e/ui/receipt-attach.e2e.spec.ts` against a local Supabase; record the result or that it was not run. Result (2026-11-02, user approved the linked test project): migration applied alone (history was out of sync, so `db push` was not used) and recorded with `migration repair`; `supabase/verification/clarify-receipt-review.sql` passes 9/9 and rolls back; the Playwright spec was not run because E2E only accepts a loopback Supabase and none is available here.
- [x] 9.3 Run `openspec validate clarify-receipt-review --strict` and fix any reported issue

## Workflow follow-up

- Archive the change after review with `/opsx:archive`, which syncs the delta specs into `openspec/specs/`.
