# Proposal

## Why

A list can currently be deleted while an active trip uses it. The foreign key cascades the delete to the trip, so the floating session bar can no longer open it. Preventing deletion while the trip is active keeps both records available.

## What Changes

- Do not offer list deletion while that list has an active trip.
- Reject deletion at the server and database boundary when an active trip exists, including stale clients and concurrent start/delete requests.
- Allow list owners to read active trips associated with their own lists so the trigger sees trips owned by another account.
- Return a conflict that lets the UI explain that the trip must be completed or cancelled before deleting the list.
- After the trip is no longer active, delete the list immediately after confirmation, keep the confirmation locked until the Lists route refreshes, and do not offer Undo.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `list-cards`: make list deletion conditional on there being no active trip for the list.

## Impact

- List card menu and delete feedback.
- Both existing deletion paths: the versioned base-list API and the legacy Server Action.
- Shared base-list service and an atomic database operation/migration to serialize deletion against starting a trip.
- Tests for active and inactive lists, stale UI, both deletion paths, and concurrent start/delete behavior.
