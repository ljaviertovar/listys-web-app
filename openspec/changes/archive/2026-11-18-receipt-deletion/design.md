# Design

## Context

See `proposal.md` and `specs/confirmed-deletion/spec.md` for motivation and behavior. Receipt deletion uses `SheetDialog`, whose `busy` prop already blocks dismiss requests and disables its close control. List deletion currently schedules a delayed action with `useUndoableAction`, closing its `ConfirmSheet` immediately. Trip cancellation already uses `ConfirmSheet.loading` to block dismissal, but its error path closes the sheet. The separate `protect-list-deletion-during-active-trip` change defines the server-side active-trip guard.

## Goals / Non-Goals

**Goals:**

- Reuse the existing modal primitives and their busy/loading behavior for all three flows.
- Keep each confirmation mounted while its request is pending; close through the successful destination navigation.
- Keep the modal open and restore interaction after failure, with an actionable error inside the sheet.
- Make list deletion immediate after confirmation and remove its undo timer/action.

**Non-Goals:**

- Add a new modal primitive, deletion service layer, or database migration.
- Change trip cancellation's underlying data semantics or receipt deletion's record semantics.
- Modify undo behavior for non-deletion operations such as store merges or item edits.

## Decisions

### Reuse the existing busy and loading props

Pass `busy={deleting}` to the receipt `SheetDialog`, and use the existing `loading` prop on list and trip `ConfirmSheet` instances. Keep their controlled `open` state true while pending and do not explicitly close before calling `router.push` or refreshing the Lists route. This avoids duplicating the modal's dismissal and background interaction logic. A new generic deletion framework was considered but is unnecessary for these three established flows.

### Keep errors in the confirmation

On failure, clear the pending state and render the actionable error in the open confirmation. Do not close the list or trip sheet from a catch handler. Existing error toasts may remain as supplemental feedback, but cannot be the only error because the sheet is the recovery surface. No success toast may include an Undo action.

### Delete lists immediately

Replace `useUndoableAction` for list deletion with a direct delete request from the confirmation. On success, show at most a plain success toast and refresh/navigate to `/shopping-lists`; on failure, leave the card and sheet available. Preserve the server-side rejection for a list with an active trip as specified by `protect-list-deletion-during-active-trip`.

### Keep entity-specific destinations

After success, receipts navigate to `/tickets`, lists return to `/shopping-lists`, and cancelled trips navigate to `/dashboard`. Receipt deletion invoked from trip details still returns to Receipts, matching the requested receipt flow. The confirmation closes by unmounting during the destination transition, not before the mutation resolves.

## Risks / Trade-offs

- [A navigation may resolve slowly after a successful delete] → Keep the confirmation busy until the destination transition removes it; do not expose an enabled confirm button during that interval.
- [A failed request could leave stale data behind the sheet] → Keep the list/receipt/trip intact in the UI, show the error in the sheet, and allow retry or cancel.
- [Removing list Undo makes confirmation the last reversible checkpoint] → Keep the consequence copy explicit and make the confirm action wait for the actual request.

## Migration Plan

No database migration is required. Deploy the UI behavior and existing delete APIs together. Roll back by restoring the prior confirmation handlers; no stored data needs to be transformed.
