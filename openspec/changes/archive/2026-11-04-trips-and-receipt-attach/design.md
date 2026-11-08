# Design

## Context

See proposal.md (Why). Current state that shapes the approach:

- `/shopping-history` is a server page fed by the `getShoppingHistory` server action. Its query does not select the
  trip's receipt, so `HistorySessionCard`'s `Receipt` badge never renders today. `/shopping-history/[groupId]` already
  `permanentRedirect`s. `resolveSessionBackLink` maps `from=history|history-group` to the history.
- The trip page (`shopping/[runId]/page.tsx`) renders `TripReceiptsCard` for a completed trip without receipt and
  passes `sessionId` only when the viewer owns the trip. The card wraps `UploadTicketDialog`, whose form posts to
  `/api/upload-ticket` (with `shopping_session_id` since `clarify-receipt-review`) and then `router.push`es to the receipt.
- The review lives in `features/tickets/attach/`: `useAttachToSession({ ticketId, items, receiptStore, totalAmount })`
  loads candidates, then matches and session items; `AttachToSessionDialog` shows "Review how this receipt will update
  the trip" in its description as soon as a candidate exists, including while the review loads.
- `attachTicketToSession` (service) rejects any ticket whose `uploaded_from_session_id` differs from the payload session
  (`RECEIPT_NOT_FROM_TRIP`). The RPC `attach_receipt_to_session` (latest body in `20261028000000_close_the_loop.sql`)
  rejects completed sessions outside `receipt_attach_window()` and never touches quantities of matched items: an active
  session copies each session item's planned quantity into the list on completion; a completed one leaves the list as
  completion left it. `ticket_session_candidates` (latest body in `20261102000000_clarify_receipt_review.sql`) also
  applies the window.
- OCR is asynchronous. `TicketStatusListener` follows one ticket with Realtime plus a 3 s poll of the status endpoint and
  calls `router.refresh()` on a terminal status.
- Validation here has no local Supabase or auth (project memory): E2E specs cannot run in this environment; visual checks
  use a temporary fixture route with stubbed Supabase requests.

## Goals / Non-Goals

**Goals:**
- One review component used from both the receipt page and the trip page, opened only with a read receipt.
- Server-side rules (window removal, origin rule, quantity replacement) enforced in the service and the RPC, not the UI.
- Keep the attach payload contract unchanged.

**Non-Goals:**
- Adding a receipt to an active trip from the trip page (the card stays on completed trips; the receipt page still
  offers the origin trip while it is active).
- Attaching more than one receipt to a trip, or detaching one.
- Renaming the `shopping-history-by-list` capability, the `getShoppingHistory` action or `history-*` component files:
  only routes, copy and test ids that users or links see change.
- Changing the standalone add-to-list quantity rule from `clarify-receipt-review`.

## Decisions

### 1. `/trips` route and redirects

Move `app/(authenticated)/shopping-history/page.tsx` to `app/(authenticated)/trips/page.tsx`. Keep
`shopping-history/page.tsx` as a server `permanentRedirect` to `/trips` that forwards a single `list` value, and point the
existing `shopping-history/[groupId]` redirect to `/trips`. Trip links use `from=trips`; `resolveSessionBackLink` accepts
`trips` and still maps the legacy `history` and `history-group` origins, all with the label "Back to Trips". Nav
(`nav.ts` sidebar and `MOBILE_TAB_ITEMS`) and the two dashboard links point to `/trips` with the title "Trips".

- *Alternative:* a `next.config` redirect. Rejected: the group redirect is already a page; keeping both as pages keeps
  the `list` forwarding testable in a unit test.

### 2. Receipt status in Trips

`getShoppingHistory` adds the receipt to each trip in a second owner-scoped query (`tickets` with `shopping_session_id
in (...)`, selecting `id, shopping_session_id`), mirroring `getShoppingSession`. It avoids guessing the PostgREST name of
the composite FK. `HistorySessionCard` shows `Completed` (`completed` badge) and a receipt badge: `Receipt attached`
(`completed`) or `No receipt` (`processing`, amber), and, without receipt, a `primary` `Add Receipt` button rendered as a
link (`asChild`) to `/shopping/{id}?from=trips&receipt=add`, next to `View Details`. Trips only lists the owner's trips,
so no ownership check is needed for the action. Variants exist already; DESIGN.md 11.6 is updated.

### 3. Trip page receipt states

The trip page computes one `TripReceiptState` server-side and passes it to `TripReceiptsCard`:
`attached` (card not rendered, summary as today) · `none` · `reading` / `read` / `failed` for the most recent ticket with
`uploaded_from_session_id = session`, `shopping_session_id is null` and `base_list_id is null` (one owner-scoped query).
The header shows `Completed` plus a `No receipt` badge when there is no receipt. The card:

- `none`: "No receipt" (or "Trip saved" on `saved=1`) and `Add Receipt`, which opens a small A1 sheet with
  `Upload New Receipt` and `Choose Uploaded Receipt`. `receipt=add` in the URL opens that sheet on load.
- `reading`: "Reading your receipt…" with a status chip; a client child reuses the status-following logic of
  `TicketStatusListener` (extracted to a `useTicketStatus` hook in `tickets/receipt/hooks/` so both share it) and calls
  `router.refresh()` on a terminal status.
- `read`: "Your receipt is ready" and `Review Receipt`, which opens the review.
- `failed`: "We couldn't read this receipt", `Open Receipt` (retry lives there) and `Add Receipt`.

The 48-hour note is removed. Only the trip owner gets actions (unchanged `sessionId` rule).

### 4. Upload from a trip stays on the trip

`UploadTicketForm` skips `router.push` to the receipt when `shoppingSessionId` is set and lets the dialog's existing
`router.refresh()` re-render the trip, which then lands in `reading`. Success toast copy says the receipt is being read.

### 5. Choosing an uploaded receipt

New `GET /api/v1/shopping-sessions/{sessionId}/available-receipts` (Route Handler + `shopping-sessions` service, Zod on
the param, owner-scoped). The service first loads the session for `user.id` (`404` otherwise) and then the user's
tickets with `ocr_status = 'completed'`, `shopping_session_id is null`, `base_list_id is null` and
`uploaded_from_session_id is null or = sessionId`, newest first, limited to 50. DTO per receipt: `id, created_at,
store { id, name } | null, total_amount, item_count, selectable, reason` where `reason = 'STORE_MISMATCH'` when the
session is completed with a store and the receipt's confirmed store differs (the same rule the RPC enforces). The sheet
lists them as radio rows (the `StorePickerDialog` pattern) with an empty state offering `Upload New Receipt`; choosing one
opens the review. The client endpoint lives in `lib/api/endpoints/shopping-sessions.ts`.

- *Alternative:* a server action. Rejected: it is a read with a natural REST resource next to the existing
  `shopping-sessions/{id}` routes, and the sheet loads it on demand.

### 6. One review, fixed trip

Split `useAttachToSession` so the review part takes a known session: `useTripReview({ ticketId, session })` loads the
ticket (`getTicket` for items, store and total) plus matches and session items, and owns links, added lines, total and
submit. `useAttachToSession` keeps loading the origin candidate on the receipt page and delegates to it. The
dialog's description shows "Review how this receipt will update the trip" only when the ticket and matches are loaded;
while loading it shows the trip name and a `role='status'` loading line. Cancel closes without a request. On success
from the trip page it calls `router.refresh()` (the page then shows the receipt summary); from the receipt page it keeps
`router.push` to the trip.

### 7. Origin rule in the service

`attachTicketToSession` throws `RECEIPT_NOT_FROM_TRIP` only when `uploaded_from_session_id` is not null and differs
from the payload session. A receipt without origin can be attached to any own session, which is what the trip chooser
sends. The RPC stays the single writer and keeps its ownership, store and uniqueness checks.

### 8. Migration: no window, purchased quantity

One additive migration with `CREATE OR REPLACE` of:

- `ticket_session_candidates`: the clarify body without the window condition (origin, active or completed without
  receipt).
- `attach_receipt_to_session`: the close-the-loop body with two changes. (a) Drop the `SESSION_OUT_OF_WINDOW` check.
  (b) After the line loop, for each matched session item compute `SUM(COALESCE(ti.quantity, 1))` and the shared unit
  over its lines (the same grouping the store-stats block uses); when the lines share one unit, set the session item's
  `quantity` and `unit` to them. For an active session, `apply_session_completion` then copies them to the list as it
  already does. For a completed session, update the matching `base_list_items` row (`base_list_id`, `normalized_name`)
  to the same quantity and unit. Added lines keep their current behavior (they already take the line's quantity).

`receipt_attach_window()` is left in place, unused by these functions (dropping it is unnecessary and keeps rollback
trivial). `SESSION_OUT_OF_WINDOW` stays in the RPC error map for old function bodies. A SQL verification script covers
the quantity scenarios and an old completed session.

- *Alternative:* compute quantities in the TS service and send them. Rejected: the RPC is the transaction boundary and
  already groups lines per target for store stats.

## Risks / Trade-offs

- [Two pending receipts uploaded from the same trip] → The card follows the most recent one; the other stays in the
  chooser (its origin is this trip), so nothing is lost.
- [Polling from the trip page while reading] → Same 3 s poll plus Realtime the receipt page already uses, stopped on a
  terminal status or unmount.
- [Old trips now take receipts] → They only gain prices, total and quantity; completion already counted the purchase, and
  the RPC's completed-session branch never adds another.
- [Quantity replacement after a partial purchase] → Intended by the request; the standalone add-to-list rule stays as is,
  and checked items without a line keep their quantity.
- [Ordering with `clarify-receipt-review`] → Its deltas must be archived first; tasks start with that check.

## Migration Plan

1. Archive `clarify-receipt-review` so its requirements exist in `openspec/specs/`.
2. One additive migration (two `CREATE OR REPLACE FUNCTION`), with a header that lists every statement and confirms no
   `DELETE`/`UPDATE`/`DROP`/`TRUNCATE`/backfill at migration time. Regenerate `database.types.ts` if signatures change
   (they do not).
3. Deploy server and UI together. Old bookmarks redirect to `/trips`.
4. Rollback: redeploy the previous app and re-run the previous `CREATE OR REPLACE` bodies from
   `20261028000000_close_the_loop.sql` and `20261102000000_clarify_receipt_review.sql`. Quantities already replaced stay
   as written (they are ordinary item edits).
