# Design

## Context

See `proposal.md` for motivation and `specs/list-cards/spec.md` for the behavior contract. List deletion currently exists through both the versioned API and a Server Action. The database cascades list deletion to its shopping sessions. The active-session bar relies on the trip and its list both remaining available.

## Goals / Non-Goals

**Goals:**

- Make an active trip an invariant that prevents its list from being deleted through any write path.
- Hide the delete action for lists already known to have an active trip, while handling stale UI safely.
- Delete lists without active trips immediately after confirmation; keep the confirmation locked until the Lists route refreshes and do not offer Undo.

**Non-Goals:**

- Change trip completion/cancellation semantics or the floating session bar.
- Replace the existing API or Server Action.

## Decisions

### Enforce the invariant in Postgres

Add a `BEFORE DELETE` trigger on `public.base_lists` that checks for a matching `shopping_sessions` row with `status = 'active'`. When found, it raises a stable application-recognizable SQLSTATE/message and includes the active session ID in `DETAIL`. The trigger is `SECURITY INVOKER`; it uses no elevated role or bypass of RLS. Because it runs in the same transaction as the delete, both existing application paths and any direct table delete receive the same protection. The parent row lock and the session foreign key's key-share lock serialize a concurrent session insert against deletion.

An application-only check was considered and rejected: it would be duplicated across the API and Server Action and could race with a new trip between the check and the delete. A callable RPC alone was also rejected because the existing table delete policy would leave other direct delete paths outside that function.

Add a SELECT policy on shopping sessions scoped to active trips on lists owned by the requesting user. This lets the invoker trigger see an active association even if another account owns the trip. Existing write permissions still apply.

### Keep the UI check advisory

The Lists page already loads active session IDs and passes the matching ID to each `BaseListCard`. Use that value to omit the Delete List action while active. It improves discoverability, but is not the security or integrity boundary; the database trigger handles stale pages and concurrent requests.

### Map the database rejection to a conflict

The shared delete service and the Server Action must recognize the trigger's stable error identifier and return a `409`/conflict result with a safe message. The client keeps the card and confirmation, unlocks it for recovery, and tells the user to complete or cancel the trip. Do not expose raw SQL or provider error text. When the trigger allows deletion, run the delete immediately and show no Undo action.

## Risks / Trade-offs

- [A trigger error could be surfaced as a generic server failure] → Map only the stable trigger identifier to the conflict contract in both deletion paths; keep other database errors on their current safe error path.
- [A stale page may still show the delete menu] → The database remains authoritative, and the client displays the conflict while retaining the list.
- [A future active-session status could use a new value] → Keep the predicate aligned with the existing canonical `status = 'active'` contract and its partial unique index.

## Migration Plan

1. Add the trigger function, trigger, and active-trip SELECT policy. The migration preserves all existing rows.
2. Deploy application error mapping and the advisory menu change with the trigger in the normal migration sequence.
3. Verify the trigger blocks a list with an active trip, permits a list with no active trip, and does not affect a trip after it is completed or cancelled.
4. Roll back by removing the trigger, its function, and the added SELECT policy.

Before applying the migration, inspect it to confirm it contains only the approved schema additions and cannot remove records directly or through cascades.
