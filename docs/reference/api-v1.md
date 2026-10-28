# API v1 repository reference

Snapshot of Route Handlers on 2026-10-27. This inventory describes current behavior; it is not a complete OpenAPI
contract or proof of policy compliance. [AGENTS.md](../../AGENTS.md) defines the required API policy.

## Authentication and responses

Product handlers use the signed-in Supabase cookie session via
[`createAuthenticatedClient`](../../src/lib/api/auth.ts). Private reads/writes require server authorization and RLS;
experimental sharing adds collaborator checks. This audit did not verify installed remote policies.

- Successful responses generally use `{ "data": ... }`; no-body deletes use `204`.
- Errors use `{ "error": { "code": "...", "message": "...", "details": {}, "request_id": "..." } }` through
  [`http.ts`](../../src/lib/api/http.ts). `details` and `request_id` are optional in the type; wrapped failures get a
  generated request ID. Some error messages currently propagate internal errors; see the [audit findings](implementation-status.md#audit-findings-and-follow-up).
- JSON bodies are parsed with Zod. Malformed JSON returns `400`; schema failures return `422`. Request schemas are
  generally non-strict objects that strip unknown fields. Upload uses multipart handling with manual checks.
- Many responses directly expose selected row shapes; response allowlists/versioned schemas and full collection
  pagination remain follow-up work. Do not assume every collection is bounded or returns `meta` and `links`.
- The shared helper does not add a `Location` header to creations. Content negotiation, idempotency keys, conditional
  updates and rate limiting are not established by this inventory.

| HTTP status | Observed meaning |
| --- | --- |
| `200` | Successful read/update/action. |
| `201` | Creation for groups, lists, items, sessions and experimental invite links. |
| `202` | Ticket accepted for asynchronous OCR; completion is a separate status. |
| `204` | Successful delete without a response body. |
| `400` | Malformed JSON or upload/domain request rejection. |
| `401` | No authenticated user. |
| `403` / `404` | Permission denial or invisible/missing resource, depending on the service. |
| `409` | Duplicate/state/limit conflict. |
| `410` | Experimental invite expired or exhausted. |
| `422` | Zod validation failure. |
| `500` | Internal/database/provider failure; current services do not consistently map dependency failures to `503`. |

Error codes declared in `http.ts`: `UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `LIMIT_EXCEEDED`,
`INTERNAL_ERROR`, and `BAD_REQUEST`. A code does not uniquely determine a status; invite expiry uses `BAD_REQUEST`/`410`.

## Route inventory

All paths below begin with `/api/v1`. Brace segments are route parameters, normally UUIDs; invite tokens are nonempty
strings. The inventory maps directly to [`src/app/api/v1/`](../../src/app/api/v1/).

| Path | Methods | Purpose |
| --- | --- | --- |
| `/groups` | GET, POST | List/create owner groups. Unchanged; the web app stopped using the `/groups*` endpoints in PRD v3 Phase 2 (groups are internal), and they stay for existing clients. |
| `/groups/{groupId}` | GET, PATCH, DELETE | Read/update/delete a group. |
| `/groups/{groupId}/base-lists` | GET | Lists in an owner group. |
| `/groups/history` | GET | Groups with completed sessions; existing specialized read. |
| `/base-lists` | GET, POST | List the owner's base lists (name, notes, group, creation date, item count; ordered by name, then creation) / create one; `group_id` is optional on create. |
| `/base-lists/{baseListId}` | GET, PATCH, DELETE | Read/update/delete a list; each item includes its usual-store summary; shared reads are experimental. |
| `/base-lists/{baseListId}/items` | POST | Create an item; list ID comes from the path. |
| `/base-list-items/{itemId}` | PATCH, DELETE | Update/delete an item; PATCH can set or clear its usual store. |
| `/shopping-sessions` | GET, POST | History/default completed read, or create a session optionally scoped to a store. `?status=active` returns the most recent visible active session. |
| `/shopping-sessions/{sessionId}` | GET, PATCH, DELETE | Read/update a session, including its store and each item's scope flag; DELETE invokes cancellation. PATCH cannot set `status` to `completed`. |
| `/shopping-sessions/{sessionId}/complete` | POST | Complete the session and always apply its checked items to the base list, in one database transaction. |
| `/shopping-sessions/{sessionId}/items` | POST | Create a session item. |
| `/shopping-session-items/{itemId}` | PATCH, DELETE | Update/delete a session item. |
| `/shopping-sessions/active` | GET | Deprecated alias; see compatibility table. |
| `/shopping-sessions/{sessionId}/cancel` | POST | Deprecated alias; see compatibility table. |
| `/tickets` | GET, POST | List receipts (each with `store`: the confirmed store's `id` and `name`, or null) or upload multipart photos. |
| `/tickets/{ticketId}` | GET, PATCH, DELETE | Read receipt/items (with `store` and `store_suggestion`), assign or clear its store and update group assignment, or delete. |
| `/tickets/{ticketId}/status` | GET | `{ "data": { "ocr_status": "pending" } }`; status can also be processing/completed/failed. |
| `/tickets/{ticketId}/retry-ocr` | POST | Clear extracted items and restart processing. |
| `/tickets/{ticketId}/matches` | GET | `?base_list_id=` required: how every line of the receipt matches that list (`name`, `alias` or `none`, with the matched item). |
| `/tickets/{ticketId}/session-candidates` | GET | List the caller's eligible active or recently completed sessions for this receipt. |
| `/tickets/{ticketId}/session-matches` | GET | `?shopping_session_id=` required: match receipt lines against items in the selected session. |
| `/tickets/{ticketId}/attach-to-session` | POST | Atomically attach a read receipt to an eligible session, reconcile selected lines, and optionally complete an active session. |
| `/tickets/{ticketId}/merge-to-base-list` | POST | Merge selected receipt items into an existing list, applying optional `links` from the review step. |
| `/tickets/{ticketId}/create-base-list` | POST | Create a list from selected receipt items; currently returns `200`. |
| `/tickets/{ticketId}/assign-group` | POST | Deprecated alias; see compatibility table. |
| `/tickets/maintenance/orphaned-images` | GET | Invoke orphan-image report RPC. |
| `/tickets/maintenance/cleanup-orphaned-images` | POST | Invoke image-cleanup RPC; mutates storage/data. |
| `/tickets/maintenance/mark-stuck-as-failed` | POST | Invoke stuck-ticket recovery RPC; mutates statuses. |
| `/base-lists/{baseListId}/invites` | GET, POST | Experimental owner invite management. |
| `/base-lists/{baseListId}/invites/{inviteId}` | DELETE | Experimental invite revocation. |
| `/base-lists/{baseListId}/collaborators` | GET | Experimental collaborator list. |
| `/base-lists/{baseListId}/collaborators/{userId}` | DELETE | Experimental collaborator removal. |
| `/invites/{token}/accept` | POST | Experimental acceptance; grants list access. |
| `/stores` | GET, POST | List the caller's stores (`id`, `name`, `receipt_count`, timestamps; ordered by name; `meta.count` and `meta.limit`) / create one (`201` with `Location`). |
| `/stores/{storeId}` | PATCH | Rename a store; its previous name keeps resolving to it. |
| `/stores/{storeId}/merge` | POST | Move another store's receipts and names into this one and remove the other store, in one transaction. |

Maintenance handlers are not safe diagnostics by default: inspect database function authorization and affected scope
before invoking them. This audit did not execute them.

## Request boundaries

| Operation | Shape and constraints | Runtime schema |
| --- | --- | --- |
| Group create/update | `name` 1–100 characters, `description` up to 500; fields optional on PATCH. | [`group.ts`](../../src/lib/validations/group.ts) |
| List create/update | Create requires `name` 1–100; `group_id` is an optional UUID (null is accepted): omitted, the list goes to the user's default group, created on first use; supplied, it must be a group of the caller (`404` otherwise, with no difference between a missing and a foreign group). `notes` nullable/optional up to 500. Names are unique per user, ignoring case, across all groups (`409` otherwise); saving a list under its own name, or changing only its case, is accepted. PATCH accepts name/notes. | [`base-list.ts`](../../src/lib/validations/base-list.ts) |
| Item create/update | Name up to 200, quantity 0.1–99 in 0.1 steps, optional unit/notes/category. Path determines parent on nested POST. | [`base-list.ts`](../../src/lib/validations/base-list.ts), [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts) |
| Session create | UUID `base_list_id`, `name` 1–100, optional `store_id` (UUID or null). When supplied, the session includes only items usual at or previously purchased at that store; other items remain available in the session as `is_other_store`. A list with an active session returns `409 CONFLICT` and `details.activeSessionId`; an empty list returns `409 CONFLICT`; a missing list or store outside the caller's scope returns `404`. | [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts), [`shopping-sessions.service.ts`](../../src/lib/server/services/shopping-sessions.service.ts) |
| Session reads | `GET /shopping-sessions/{sessionId}` adds `store: { id, name } \| null` and `is_other_store` on each session item; completed-session history adds `store: { id, name } \| null`. Whole-list sessions have `store: null` and `is_other_store: false`. | [`shopping-sessions.service.ts`](../../src/lib/server/services/shopping-sessions.service.ts) |
| Base-list item usual store | `PATCH /base-list-items/{itemId}` accepts `usual_store_id` (UUID or null). This field must be the only field in the PATCH (`422` if combined); a store or item outside the caller's scope returns `404`. The response adds `usual_store: { id, name, source } \| null` and `other_stores: [{ id, name, purchase_count }]`, with the usual store omitted from `other_stores`. | [`base-list.ts`](../../src/lib/validations/base-list.ts), [`base-lists.service.ts`](../../src/lib/server/services/base-lists.service.ts) |
| Base-list item store summary | `GET /base-lists/{baseListId}` adds `usual_store` and `other_stores` to each item. `other_stores` is ordered by purchase count descending, then most recent purchase; raw statistics rows are not returned. Collaborators may see `usual_store: null` and `other_stores: []` when RLS hides the store data. | [`base-lists.service.ts`](../../src/lib/server/services/base-lists.service.ts) |
| Session update (PATCH) | Optional `name` 1–100, `status` (only `active`; `completed` returns `422` and points to the complete operation), positive `total_amount`, `general_notes` up to 1000. `sync_to_base` is stripped. | [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts) |
| Session complete | Optional positive `total_amount`, `general_notes` up to 1000. `sync_to_base` is deprecated: accepted with any boolean, ignored, completion always syncs. | [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts) |
| Ticket upload | Multipart repeated `files`: 1–5 images, each at most 10 MiB. Optional `store_name` (raw text, whitespace collapsed, at most 100 characters, blank treated as absent) is validated with Zod before any photo is stored (`422` otherwise); when it is absent, OCR fills it from the receipt header. The service also reads an optional `group_id`; file checks are manual. The web form sends photos only. | [`uploadTicket`](../../src/lib/server/services/tickets.service.ts), [`uploadTicketFieldsSchema`](../../src/lib/validations/ticket.ts) |
| Ticket PATCH | At least one of `store_id` (UUID or null) and `group_id` (UUID or null). `store_id` assigns one of the caller's stores and remembers the receipt's raw store name as an alias of it, or clears it with null (the store is kept); a store or receipt that is missing or someone else's returns `404`. | [`updateTicketSchema`](../../src/lib/validations/ticket.ts), [`ticket handler`](../../src/app/api/v1/tickets/[ticketId]/route.ts) |
| Receipt matches | Query `base_list_id` (UUID, required, `422` otherwise). Returns `{ "data": [{ "ticket_item_id", "match": "name" \| "alias" \| "none", "base_list_item": { "id", "name" } \| null }] }` for every line of the receipt; `404` for a receipt or list that is not the caller's. | [`matches handler`](../../src/app/api/v1/tickets/[ticketId]/matches/route.ts) |
| Session candidates | No query parameters. Returns `{ "data": [{ "id", "name", "status", "started_at", "completed_at", "store", "base_list", "checked_count", "item_count" }] }` for the caller's active sessions and completed sessions within the 48-hour attachment window. Unread receipts, receipts already added to a list, sessions with a receipt, and sessions outside the window are not eligible. | [`session-candidates handler`](../../src/app/api/v1/tickets/[ticketId]/session-candidates/route.ts) |
| Session matches | Query `shopping_session_id` (UUID, required, `422` otherwise). Returns `{ "data": [{ "ticket_item_id", "match": "name" \| "alias" \| "none", "shopping_session_item": { "id", "name", "checked" } \| null }] }` for every receipt line. | [`session-matches handler`](../../src/app/api/v1/tickets/[ticketId]/session-matches/route.ts) |
| Attach receipt to session | Strict JSON body: required `shopping_session_id`; optional `links` (`ticket_item_id`, `shopping_session_item_id` UUID or null), `added_item_ids` (UUIDs), and `total_amount` (number ≥ 0 or null). A line cannot be both linked and added. Returns `{ "data": { "completed_now", "matched_count", "checked_now_count", "added_count", "priced_count", "over_limit_count", "replayed" } }`; retrying the same attachment is idempotent and reports `replayed: true`. Known conflicts return `409 CONFLICT` with `details.reason` and, when available, `details.shopping_session_id`: `RECEIPT_NOT_READ`, `RECEIPT_ATTACHED`, `RECEIPT_ADDED_TO_LIST`, `SESSION_HAS_RECEIPT`, `SESSION_OUT_OF_WINDOW`, or `STORE_MISMATCH`. Foreign or collaborator-only resources return `404`; invalid or unknown body fields return `422`. | [`attach-to-session schema`](../../src/lib/validations/ticket.ts), [`attach handler`](../../src/app/api/v1/tickets/[ticketId]/attach-to-session/route.ts) |
| Merge items | UUID `base_list_id`, 1–200 `items` entries containing UUID `id` and boolean `merge`; path ticket ID takes precedence. Optional `links` (at most 200): `{ "ticket_item_id": "UUID", "base_list_item_id": "UUID" \| null }`, each for a different selected line. An item id makes the line update that item of the list and remembers the line's name as an alias of it in this list; null adds a line that matched a remembered alias as a new item and forgets that alias. A line with the same name as an item cannot be linked. Lines without a link update the item of the same name, else the item of a remembered alias, else create an item; only created items count toward the list limit. Invalid links return `422`, a missing list or receipt `404`, a full list `409 LIMIT_EXCEEDED`, and a receipt already attached to a session `409 CONFLICT` with `details.reason = RECEIPT_ATTACHED`; nothing is written on any error. | [`ticket schemas`](../../src/lib/validations/ticket.ts), [`merge handler`](../../src/app/api/v1/tickets/[ticketId]/merge-to-base-list/route.ts) |
| List from receipt | `name` 1–100 and 1–200 UUID `item_ids`; optional `group_id` UUID with the same rules as list create (default group when omitted, `404` for a group that is not the caller's, `409` when the name is taken); the receipt is linked to the list and its group; path ticket ID takes precedence. An already attached receipt returns `409 CONFLICT` with `details.reason = RECEIPT_ATTACHED`. | [`ticket schemas`](../../src/lib/validations/ticket.ts), [`create-base-list handler`](../../src/app/api/v1/tickets/[ticketId]/create-base-list/route.ts) |
| Receipt/session read fields | `GET /tickets/{ticketId}` adds `total_amount` and `shopping_session: { id, name, status } \| null`; `GET /shopping-sessions/{sessionId}` adds `receipt: { id, total_amount } \| null` and the linked receipt line price on each session item; completed-session history adds `receipt: { id } \| null`. These are additive v1 response fields and clients must ignore unknown fields. | [`tickets.service.ts`](../../src/lib/server/services/tickets.service.ts), [`shopping-sessions.service.ts`](../../src/lib/server/services/shopping-sessions.service.ts) |
| Store create/rename | `name` 1–100 characters after collapsing whitespace; it must contain at least one letter or digit once a branch number such as `#123` is ignored (`422` otherwise). Names are compared ignoring case, accents, spaces, punctuation and branch numbers, so "No Frills", "NOFRILLS" and "No Frills #3127" are the same store: a name that already belongs to another of the caller's stores returns `409 CONFLICT` with `details.store_id`. At `MAX_STORES_PER_USER` stores, create returns `409 LIMIT_EXCEEDED`. A store that is missing or someone else's returns `404`. | [`store.ts`](../../src/lib/validations/store.ts), [`stores.service.ts`](../../src/lib/server/services/stores.service.ts) |
| Store merge | `{ "source_store_id": "UUID" }`; the path store is the one that remains. The same id on both sides returns `422`; either store missing or someone else's returns `404`. Responds with the remaining store and its new `receipt_count`. | [`store.ts`](../../src/lib/validations/store.ts) |
| Experimental invite | Optional `expires_in_days` integer 1–30 and `max_uses` integer 1–100. Empty JSON object is accepted. | [`sharing.ts`](../../src/lib/validations/sharing.ts) |

Example creation request: `POST /api/v1/groups` with `Content-Type: application/json` and
`{ "name": "Weekly Shopping", "description": "Reusable household lists" }`.
Example upload response: `202` with `{ "data": { "ticketId": "opaque-ticket-id" } }`.
Examples contain no real identifiers or credentials. See [limits](limits.md) for centralized values.

## Compatibility and migration

| Existing route | Successor | Current behavior |
| --- | --- | --- |
| `POST /api/upload-ticket` | `POST /api/v1/tickets` | Legacy `202` returns bare `{ "ticketId": "..." }`; v1 wraps `data`. Legacy errors are `{ "error": "message" }`. No deprecation headers in this handler. |
| `GET /api/tickets/{ticketId}/status` | `GET /api/v1/tickets/{ticketId}/status` | Legacy returns bare status; v1 wraps `data`. No deprecation headers in this handler. |
| `GET /api/v1/shopping-sessions/active` | `GET /api/v1/shopping-sessions?status=active` | Deprecated headers are emitted. |
| `POST /api/v1/shopping-sessions/{sessionId}/cancel` | `DELETE /api/v1/shopping-sessions/{sessionId}` | Deprecated POST returns `{ "data": { "success": true } }`; DELETE returns `204`. |
| `POST /api/v1/tickets/{ticketId}/assign-group` | `PATCH /api/v1/tickets/{ticketId}` | Deprecated body uses `groupId`; successor uses `group_id` and accepts null. |
| `sync_to_base` field of `POST /api/v1/shopping-sessions/{sessionId}/complete` | None: completion always syncs | Deprecated since PRD v3 Phase 1 (2026-10-23). The field is still accepted but ignored, so a client sending `false` now gets the sync as well. No `Deprecation`/`Sunset` headers are emitted for a field. Clients should stop sending it. Introduce a new major version before reinstating an opt-out. |

Lists without groups (PRD v3 Phase 2, 2026-10-24). Compatible changes inside v1, no new major version and no deprecation headers:

- `group_id` is optional on `POST /api/v1/base-lists` and `POST /api/v1/tickets/{ticketId}/create-base-list`. Without it the
  list is stored in the caller's implicit default group (`ensure_default_group`, created on first use, also for accounts
  that already had lists). Clients that still send it keep working.
- `GET /api/v1/base-lists` adds `notes` and `created_at`; the order is name, then creation date. Clients must ignore unknown fields.
- A supplied `group_id` must belong to the caller: `404 NOT_FOUND` ("Group not found") for a group that is missing or someone
  else's. Before this change the database did not check it, so a list could be inserted into another user's group.
- The `409 CONFLICT` for a duplicate list name now applies across all of the caller's lists, not only within one group, and
  `create-base-list` now checks the name too. Existing lists that share a name keep working and are never renamed.
- `/groups*`, `PATCH /tickets/{ticketId}` with `group_id` and `GET /tickets` (still returning `group`) are unchanged.

Source: [`default-group.service.ts`](../../src/lib/server/services/default-group.service.ts),
[`find-list-by-name.ts`](../../src/lib/server/services/find-list-by-name.ts),
[`base-lists.service.ts`](../../src/lib/server/services/base-lists.service.ts) and the
[migration](../../supabase/migrations/20261024000000_ensure_default_group.sql).

Stores (PRD v3 Phase 3, 2026-10-25). Compatible changes inside v1, no new major version and no deprecation headers:

- New resources `/stores`, `/stores/{storeId}`, `/stores/{storeId}/merge` and the read `/tickets/{ticketId}/matches` (above).
- `PATCH /tickets/{ticketId}` accepts `store_id`; `merge-to-base-list` accepts optional `links`. Without `links` a merge only
  differs from before when the list has remembered aliases, and those exist only after the caller linked lines with the new
  field, so existing clients see no change.
- Receipt reads add `store_id`, `store` and (single receipt) `store_suggestion`; clients must ignore unknown fields.
- `store_name` on upload stays optional but is now validated (`422` over 100 characters instead of being stored as sent). It
  keeps its meaning (raw store text) and is filled by OCR when absent.
- `merge-to-base-list` errors are now mapped: a full list returns `409 LIMIT_EXCEEDED` and a missing list or receipt `404`
  (both were `500` with the database message), and other database errors return a generic `500` message. Store responses never include the owner id or the internal normalized key. Example:
`POST /api/v1/stores` with `{ "name": "No Frills" }` returns `201`, `Location: /api/v1/stores/opaque-store-id` and
`{ "data": { "id": "opaque-store-id", "name": "No Frills", "receipt_count": 0, "created_at": "…", "updated_at": "…" } }`.
Source: [`stores.service.ts`](../../src/lib/server/services/stores.service.ts), [`rpc-errors.ts`](../../src/lib/server/services/rpc-errors.ts)
and the [migration](../../supabase/migrations/20261025000000_stores_foundation.sql).

Store tags and scoped sessions (PRD v3 Phase 3, 2026-10-27). Compatible additions inside v1, no new major version and
no deprecation headers:

- `POST /shopping-sessions` accepts optional `store_id`; omitting it or sending `null` preserves whole-list shopping.
  A second active session for the same list returns `409 CONFLICT` with `details.activeSessionId` and the message
  "This list already has a shopping session in progress." Clients should use the detail field to resume and ignore
  unknown response fields.
- Session reads and history add `store` and item `is_other_store`; list reads add each item's `usual_store` and
  `other_stores`. Clients must ignore these new fields. Store statistics are not exposed as raw rows.
- `PATCH /base-list-items/{itemId}` accepts `usual_store_id` alone to set a manual tag or `null` to return the item to
  automatic selection. Existing item fields and their meanings are unchanged.
- A list can have one active session at a time; different lists can be shopped concurrently. Existing active sessions
  and history are not backfilled or rewritten by the additive migration.

Source: the [store-tags-and-scoped-sessions change](../../openspec/changes/store-tags-and-scoped-sessions/design.md),
[`shopping-sessions.service.ts`](../../src/lib/server/services/shopping-sessions.service.ts),
[`base-lists.service.ts`](../../src/lib/server/services/base-lists.service.ts) and the
[migration](../../supabase/migrations/20261027000000_store_tags_and_scoped_sessions.sql). The migration has not been
applied to a database as part of this implementation.

Session completion contract: `POST /api/v1/shopping-sessions/{sessionId}/complete` returns `200` with
`{ "data": { "success": true, "sync": { "new_count": 0, "updated_count": 0, "skipped_count": 0, "over_limit_count": 0 } } }`.
`over_limit_count` is the part of `skipped_count` that did not fit in the list (a full list never blocks completion);
clients must ignore unknown fields. A session that is not active returns `409 CONFLICT` without effects, which makes a
repeated request safe; a session of another user returns `404 NOT_FOUND`; any other failure returns `500 INTERNAL_ERROR`
with a generic message and leaves the session active. Source:
[`complete-session-rpc.ts`](../../src/lib/server/services/complete-session-rpc.ts) and the
[migration](../../supabase/migrations/20261023000000_pantry_defaults_and_session_completion.sql).

The three deprecated v1 aliases emit `Deprecation: true`, `Sunset: Wed, 30 Sep 2026 23:59:59 GMT`, and a successor `Link`.
They still exist after that advertised sunset as of this review. [Open question: agree a revised compatibility/removal
plan and check remaining callers before changing routes or dates.] New clients should use successors; removing existing
handlers is outside this documentation change.

`GET /api/health` is an operational endpoint outside the product versioned envelope. It returns status, timestamp,
API/database checks, and `200` or `503`. See the [deployment checks](../runbooks/deploy.md#publish-and-check).
