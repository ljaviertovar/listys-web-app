# Tasks

## 1. Receipt deletion

- [x] 1.1 Keep the receipt confirmation busy and open until deletion succeeds and navigation reaches `/tickets`; show failure in the sheet and allow retry/cancel. Verify success, failure, outside click, Escape, and background interaction in focused component tests.
- [x] 1.2 Verify receipt deletion from both the receipt page and trip details returns to `/tickets`, keeps the sheet visible during the request, and never presents an Undo action; cover both entry points in the relevant feature tests.

## 2. Trip cancellation

- [x] 2.1 Keep the Cancel Shopping sheet open and locked while cancellation is pending; on failure keep it open with an actionable error, and on success navigate to `/dashboard`. Verify pending dismissal, failure recovery, and success navigation in focused component tests.

## 3. List deletion

- [x] 3.1 Replace the deferred undoable list deletion with an immediate request from the confirmation, keep it busy until the Lists route refreshes, and show no Undo action. Verify success, failure recovery, duplicate-submit prevention, and the active-trip guard in list-card tests.

## 4. Integration and specification

- [x] 4.1 Run the focused receipt, trip-cancellation, and list-deletion tests; run `openspec validate receipt-deletion --strict` and confirm the three destinations and no-Undo behavior match the spec.

## Workflow follow-up

- Reconciled `protect-list-deletion-during-active-trip` task 2.2 to keep its active-trip deletion guard while removing the obsolete Undo requirement.
