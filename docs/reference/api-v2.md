# API v2: conditional trip item editing

This version changes item editing only. Session reads, creation, deletion, completion and receipts retain their existing v1 URLs.

## PATCH /api/v2/shopping-session-items/{itemId}

Requires a signed-in cookie session and ownership or the existing experimental collaborator permission. The UUID path and strict JSON body are validated before mutation. Browser mutations reject foreign origins. Supply `expected_version` (positive 32-bit integer) and at least one editable field: `name`, `quantity`, `unit`, `checked`, `notes`, `category`, or `sort_order`. Existing field limits still apply. Unknown fields, including `version`, `user_id` and a replacement session ID, are rejected.

Example body: `{ "checked": true, "expected_version": 5 }`.

Success is `200 { data: ItemDto }`. The DTO explicitly contains `id`, `shopping_session_id`, `name`, `normalized_name`, `quantity`, `unit`, `checked`, `notes`, `category`, `sort_order`, `price`, `is_other_store`, `created_at`, `updated_at` and `version`. Existing item reads and creation responses also include the new version. Effective changes increment it atomically; a no-op with the current version preserves it.

| Status / code | Caller action |
| --- | --- |
| `401 UNAUTHORIZED` | Sign in before retrying. |
| `404 NOT_FOUND` | Stop sending this item; it is unavailable or inaccessible. No current item is disclosed. |
| `409 ITEM_VERSION_CONFLICT` | Use `error.details.current_item` to reconcile. If it already satisfies the intention, resolve it; otherwise require explicit reapply/discard. |
| `409 SESSION_NOT_ACTIVE` | Stop manual edits; the trip ended. Preserve and report unapplied intentions. |
| `422 VALIDATION_ERROR` | Correct the input; do not retry automatically. |
| `500 INTERNAL_ERROR` | Preserve the intention and retry with backoff. Provider messages are not returned. |

Errors use `{ error: { code, message, details?, request_id } }`. Version checking happens in the same database transaction as authorization, active-state checking and writing. Do not read a version and then update unconditionally. This contract uses `expected_version`, rather than an additional ETag/If-Match token.

## Compatibility

The former PATCH `/api/v1/shopping-session-items/{itemId}` returns `410 CLIENT_UPDATE_REQUIRED` with a reload instruction and `Link` to its v2 successor. Its retirement is immediate by the product owner's decision: an old tab must reload rather than continue overwriting unconditionally. Old item Server Actions without an expected version are rejected too. DELETE retains its v1 path and requires an active trip; it is an explicit online operation.

The browser outbox stores checks only. Other edits are explicit conditional writes, not offline form synchronization. Requests time out after 30 seconds; a timeout can follow a committed mutation, so resolve retries using the returned/current version and desired value rather than assuming the server did nothing.

The current trip screen exposes checks, with no item edit/delete forms or menus. The conditional editing helpers and Server Actions remain protected for callers; this change does not add a trip editor or alter reusable-list forms.
