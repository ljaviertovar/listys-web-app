# Proposal

## Why

Receipt deletion currently closes its confirmation sheet before navigation, list deletion is deferred behind an Undo toast, and trip cancellation can close its sheet after a failure. These flows should keep destructive actions deliberate and prevent background interaction until the operation either succeeds and navigates away or fails with a recoverable message.

## What Changes

- Keep the confirmation sheet open and block dismissal and background interaction while deleting a receipt, list, or trip.
- On success, navigate to the relevant destination: Receipts for receipts, Lists for lists, and Dashboard after cancelling a trip.
- On failure, keep the sheet open, show an actionable error, unlock the interface, and allow retry or cancel.
- **BREAKING:** Remove Undo from deletion toasts and execute list deletion immediately after confirmation instead of deferring it.
- Keep the separate active-trip list deletion guard defined in `protect-list-deletion-during-active-trip`.

## Capabilities

### New Capabilities

- `confirmed-deletion`: shared confirmation, pending, failure, and navigation behavior for deleting receipts and lists and cancelling trips.

### Modified Capabilities

- `list-cards`: replace the undoable list deletion contract with immediate confirmed deletion and navigation.

## Impact

- Receipt confirmation in `DeleteReceiptButton` and its uses from receipt and trip screens.
- List confirmation and deletion in `BaseListCard`; removal of its undoable delete toast.
- Trip cancellation in `CancelSessionSheet`.
- Shared `ConfirmSheet` and `SheetDialog` behavior if their existing modal controls cannot express the required pending lock.
- Component and service/action tests for success, failure, dismissal attempts, navigation, and the absence of Undo actions.
