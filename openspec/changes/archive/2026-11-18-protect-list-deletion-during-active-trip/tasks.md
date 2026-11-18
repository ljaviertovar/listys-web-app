# Tasks

## 1. Database guard

- [x] 1.1 Add a migration with an invoker trigger that rejects deleting a base list with an active trip and a SELECT policy scoped to active trips on the caller's own lists. Review the SQL to verify it cannot delete or rewrite existing records.
- [x] 1.2 Add a focused Supabase verification script proving active-trip deletes are rejected and preserve both rows, while inactive-trip deletes and completed-trip deletes retain current behavior; run it only against the approved local Supabase database and roll back its fixtures.

## 2. Conflict handling

- [x] 2.1 Map the trigger's stable database error to HTTP 409 in the base-list API service and to a safe conflict result in the Server Action; add focused tests for the conflict mapping and for unrelated database errors remaining failures.
- [x] 2.2 Update the delete UI to hide Delete List when `activeSessionId` is present and to retain the list and confirmation with an actionable message if a stale request receives the conflict; verify active and inactive menu behavior and that deletion has no Undo flow.

## 3. End-to-end contract verification

- [x] 3.1 Add or update API and Server Action tests proving an active-trip list is not deleted through either entry point and that the conflict is returned to the caller.
- [x] 3.2 Run the targeted component, service, API, and Server Action tests; run `openspec validate protect-list-deletion-during-active-trip --strict` and verify the active trip remains reachable after a rejected delete.
