# Design

## Context

See proposal.md (Why). Current state that shapes the approach:

- The receipt screen (`features/tickets/receipt/ticket-review.tsx`) owns the selection (`useTicketSelection`) and the
  triage (`useReceiptTriage` → `buildReceiptTriage`). `buildReceiptTriage` puts every line with a reason (no price or a
  suggestion) in `check`, and builds the reason strings ("Looks like …?") itself. `ticket-items-list.tsx` renders the
  target row ("Comparing with …"), the three sections as `CategorySection`s, and one generic `Check` badge.
- Match decisions exist only inside the add dialog: `useMergeReview` keeps a `Map<ticketItemId, LineDecision>` and
  `buildMergeLinks` turns it into the `links` sent to `POST /api/v1/tickets/:id/merge-to-base-list`.
- `changeList` in `useReceiptTriage` dispatches `loading`, which `receiptItemsView` maps to the category view: that is the
  flicker. `retry` re-runs the initial effect, so it compares with the default list, not the chosen one.
- `merge_ticket_items_to_base_list` (latest body in `20261028000000_close_the_loop.sql`) sets
  `quantity = COALESCE(quantity, 0) + COALESCE(rec.quantity, 1)` for an existing item.
- Uploads go through the existing unversioned `POST /api/upload-ticket` → `uploadTicket()`; nothing records where the
  upload started. `TicketAttachCard` is rendered on the page for every read, unattached receipt not added to a list, and
  `ticket_session_candidates` returns up to 20 sessions in the 48-hour window.
- Validation here has no local Supabase or auth (see project memory): E2E specs cannot run in this environment; visual
  checks use a temporary fixture route with stubbed Supabase requests.

## Goals / Non-Goals

**Goals:**
- One per-line decision model on the receipt screen that the triage, the selection bar and the add dialog all read.
- Keep the triage pure and unit-testable: status, badges and section placement are derived from items, matches and
  decisions, never stored.
- Server-side enforcement for the two data rules (quantity kept, attach only to the origin trip).

**Non-Goals:**
- Editing a line's price, name or quantity on the receipt screen (a missing price stays a pending reason).
- A way to attach an existing standalone receipt to a trip from the trip page.
- Changing the attach review itself (groups, total field, store reconciliation) beyond dropping the chooser stage.
- Changing the initial load: the first comparison still shows the category view while it loads.

## Decisions

### 1. Decisions live in a receipt-level hook, keyed by target list

Add `useReceiptDecisions` in `features/tickets/receipt/hooks/`, owned by `TicketReview` next to the selection. It stores
`{ baseListId, decisions: Map<ticketItemId, LineDecision> }`, reuses `LineDecision` from `add-to-list/helpers/merge-review`,
and clears itself when the triage's `baseList.id` changes. It exposes `decide(id, decision)` returning the previous value
so the caller can offer Undo.

- *Alternative:* keep decisions in the dialog and only show them on the screen. Rejected: the screen needs them to move
  lines between sections and to compute the bar breakdown before the dialog opens.
- *Alternative:* store decisions in Zustand. Rejected: the state is local to one screen and dies with it; AGENTS reserves
  Zustand for client-wide state.

### 2. Triage derives sections from (items, matches, decisions)

`buildReceiptTriage(items, matches, decisions)` returns, per line, `badges` (`'in-list' | 'new' | 'confirm-match' |
'no-price'`), the `proposal` (suggested item), the `resolved` outcome (`{ kind: 'link', item } | { kind: 'new' } | null`)
and its section:

- `check` if price is missing, or if a suggestion exists with no decision;
- otherwise `matched` if it matches by name/alias or is linked by a decision;
- otherwise `fresh`.

Each section then carries `categories: CategoryGroup<ReceiptTriageLine>[]` built with the shared `groupByCategory`
(same category order as lists, receipt order inside). The string reasons go away: copy belongs to the view. Because the
sections are recomputed on every decision, counters update without extra state. `receiptBulkSelectionIds` keeps reading
the matched section's lines (now flattened from its categories).

### 3. Undo uses a plain sonner toast, not `useUndoableAction`

Decisions are local and instant, so there is nothing to defer. `TicketReview` calls `decide`, then
`toast(message, { action: { label: 'Undo', onClick: () => decide(id, previous) } })`. `useUndoableAction` is for server
mutations delayed behind the undo window and would wrongly delay the decision.

### 4. Row UI: status badges, proposal actions and Change in `TicketItemRow`

`TicketItemRow` takes `badges`, `proposal`, `resolved`, and callbacks `onConfirm`, `onChooseAnother`, `onAddAsNew`,
`onChange`. A pending proposal shows "Possible match: <item>" with `Confirm Match`, `Choose Another`, `Add as New`
(`size='sm'` buttons from the existing variants); a resolved one shows "Matches <item>" / "Adds as new item" and
`Change`, which re-shows the three actions. `Choose Another` opens the existing `LinkItemDialog` over the target list's
items, loaded once per target list with `getBaseList` (same source `useMergeReview` uses). Buttons sit outside the
row's `<label>` so a tap on them never toggles the checkbox. No new badge variant is needed: `confirm-match` uses
`merged` (primary tint: a match to decide), `no-price` uses `processing` (amber: something the receipt lacks), `in-list`
keeps `completed` and `new` keeps `neutral`. `DESIGN.md` 7.6 is updated with the new badges and copy.

### 5. Status sections and nested categories

The status section keeps `CategorySection` (title, count, fold). Inside, each category renders a lightweight caption
row (category icon, name, count) followed by its rows; it does not fold, so a section never needs two clicks to reach a
line. If the same caption appears in the category view, it is extracted to a shared presentational component under
`features/tickets/receipt/` (abstraction threshold). Derived from the 7.6 category pattern; reported as such.

### 6. List change keeps the triage view with an in-place card

Add a `switching` status to `receiptTriageReducer` that keeps the previous `baseLists` and sets `baseList` to the chosen
list; `receiptItemsView('switching')` returns `'triage'`, and the list renders the target row plus a card
"Comparing with <list>…" (spinner, `role='status'`) instead of the sections. `retry` remembers the last requested list
id and retries `changeList(id)` when the failure came from a switch. Selection is untouched; decisions clear via
decision 1.

### 7. Selection bar breakdown and copy

`TicketSelectionBar` gains an optional `breakdown?: { added: number; updated: number }`; `TicketReview` computes it from
the triage lines that are selected (updated = matched section or linked decision, regardless of section; added = the
rest). The count reads "N included", the secondary line shows the total and, when present, "N new · M updated"; the
button reads "Add or Update" (the action itself says it does both). The dialog title becomes "Add or Update Items" and its description states that new products
are added and existing ones are updated and keep their quantity. Checkbox aria-label becomes "Include <name>"; the
category-view header reads "Include all items" / "N of M included".

### 8. Dialog starts from screen decisions

`MergeToBaseListDialog` gets `initialDecisions?: { baseListId: string; decisions: ReadonlyMap<string, LineDecision> }`.
`useMergeReview.load` seeds its map with them only when `input.baseListId === initialDecisions.baseListId`, keeping only
decisions for lines in the review's `suggested`/`fresh`/`remembered` groups. `buildMergeLinks` is unchanged, so the
payload contract does not change.

### 9. Quantity rule in the merge RPC

New migration `CREATE OR REPLACE FUNCTION public.merge_ticket_items_to_base_list(...)` with the same signature, copying
the latest body and changing only the update branch to `quantity = COALESCE(base_list_items.quantity, rec.quantity, 1)`.
Store stats keep using the line quantity. Covered by a SQL verification script in `supabase/verification/`.

- *Alternative:* fix it in the TS service. Rejected: the RPC is the transaction boundary and the only writer.

### 10. Upload origin as a nullable composite FK

Same migration: `ALTER TABLE tickets ADD COLUMN uploaded_from_session_id UUID NULL` with
`FOREIGN KEY (uploaded_from_session_id, user_id) REFERENCES shopping_sessions(id, user_id) ON DELETE SET NULL
(uploaded_from_session_id)`, reusing the existing `uq_shopping_sessions_id_user_id` key, so a ticket can only point to
its owner's session at the database level. `uploadTicketFieldsSchema` accepts an optional `shopping_session_id` UUID;
`uploadTicket` verifies with the user's client that the session exists for `user.id` **before** uploading any photo and
throws a `404` otherwise. `UploadTicketDialog`/`UploadTicketForm` take an optional `shoppingSessionId` prop that
`TripReceiptsCard` passes; it is sent as a form field. The route stays at `/api/upload-ticket` (existing contract; adding
an optional field is backward compatible; not creating a new unversioned path).

- *Alternative:* URL parameter only. Rejected by the user: the offer would be lost on a later visit.

### 11. Candidates and attach limited to the origin

`CREATE OR REPLACE FUNCTION public.ticket_session_candidates` adds `AND ss.id = t.uploaded_from_session_id` (a ticket
without origin returns nothing). `attachTicketToSession` in `tickets.service.ts` reads the ticket's
`uploaded_from_session_id` first and throws `409` (`RECEIPT_NOT_FROM_TRIP`) when it is null or differs from
`shopping_session_id`. The page renders `TicketAttachCard` and `ReceiptAddedToListNote` only when the ticket has an
origin. With at most one candidate, the chooser stage of `AttachToSessionDialog`, `sortCandidatesByStore` and the
multi-candidate branch of `getAttachDialogStage` are removed with their tests.

- *Alternative:* enforce in `attach_receipt_to_session`. Rejected for now: it is a large body to copy for one check, and
  the origin column is set once at insert and not writable through any API (`PATCH` schema does not accept it).

## Risks / Trade-offs

- [Active trips lose the attach entry point in the UI: `TripReceiptsCard` only shows on completed trips] → Accepted for
  this change and recorded in DESIGN.md; the API keeps supporting attaching to an active origin trip.
- [Existing receipts have no origin, so no read receipt offers attaching after deploy] → Accepted; the 48-hour window
  makes the affected set small. No backfill (it would guess the origin).
- [The origin column is writable by its owner through the Supabase client directly] → Only the owner, only to their own
  session (composite FK); the worst case is attaching their own receipt to their own trip.
- [Decisions reset on list change may surprise] → The toast and the in-place card make the switch explicit; decisions are
  meaningless against another list's items.
- [`RECEIPT_NOT_FROM_TRIP` is a new error reason] → Thrown by the service as the same `409 CONFLICT` shape
  `mapTicketSessionAttachRpcError` produces ("This receipt cannot be attached to that trip.", `details.reason`); the
  client already shows `result.error`.

## Migration Plan

1. One additive migration: nullable column + composite FK + `CREATE OR REPLACE` of two functions. Review header lists
   every statement and confirms no `DELETE`/`UPDATE`/`DROP`/backfill (the only `ON DELETE` action clears the new
   nullable column). Regenerate `database.types.ts`.
2. Deploy server and UI together; the upload field is optional, so an old client keeps working (its uploads have no
   origin).
3. Rollback: redeploy the previous app; the column can stay unused, and the previous function bodies can be restored by
   re-running their `CREATE OR REPLACE` from `20261028000000_close_the_loop.sql`.
