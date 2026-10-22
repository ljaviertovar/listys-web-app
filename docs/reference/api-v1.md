# API v1 repository reference

Snapshot of Route Handlers on 2026-10-17. This inventory describes current behavior; it is not a complete OpenAPI
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
| `/groups` | GET, POST | List/create owner groups. |
| `/groups/{groupId}` | GET, PATCH, DELETE | Read/update/delete a group. |
| `/groups/{groupId}/base-lists` | GET | Lists in an owner group. |
| `/groups/history` | GET | Groups with completed sessions; existing specialized read. |
| `/base-lists` | GET, POST | List/create owner base lists. |
| `/base-lists/{baseListId}` | GET, PATCH, DELETE | Read/update/delete a list; shared reads are experimental. |
| `/base-lists/{baseListId}/items` | POST | Create an item; list ID comes from the path. |
| `/base-list-items/{itemId}` | PATCH, DELETE | Update/delete an item. |
| `/shopping-sessions` | GET, POST | History/default completed read, or create session. `?status=active` returns active-session data instead. |
| `/shopping-sessions/{sessionId}` | GET, PATCH, DELETE | Read/update a session; DELETE invokes cancellation. |
| `/shopping-sessions/{sessionId}/complete` | POST | Complete and optionally sync to the base list. |
| `/shopping-sessions/{sessionId}/items` | POST | Create a session item. |
| `/shopping-session-items/{itemId}` | PATCH, DELETE | Update/delete a session item. |
| `/shopping-sessions/active` | GET | Deprecated alias; see compatibility table. |
| `/shopping-sessions/{sessionId}/cancel` | POST | Deprecated alias; see compatibility table. |
| `/tickets` | GET, POST | List receipts or upload multipart photos. |
| `/tickets/{ticketId}` | GET, PATCH, DELETE | Read receipt/items, update group assignment, or delete. |
| `/tickets/{ticketId}/status` | GET | `{ "data": { "ocr_status": "pending" } }`; status can also be processing/completed/failed. |
| `/tickets/{ticketId}/retry-ocr` | POST | Clear extracted items and restart processing. |
| `/tickets/{ticketId}/merge-to-base-list` | POST | Merge selected receipt items into an existing list. |
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

Maintenance handlers are not safe diagnostics by default: inspect database function authorization and affected scope
before invoking them. This audit did not execute them.

## Request boundaries

| Operation | Shape and constraints | Runtime schema |
| --- | --- | --- |
| Group create/update | `name` 1–100 characters, `description` up to 500; fields optional on PATCH. | [`group.ts`](../../src/lib/validations/group.ts) |
| List create/update | Create requires UUID `group_id`, `name` 1–100; `notes` nullable/optional up to 500. PATCH accepts name/notes. | [`base-list.ts`](../../src/lib/validations/base-list.ts) |
| Item create/update | Name up to 200, quantity 0.1–99 in 0.1 steps, optional unit/notes/category. Path determines parent on nested POST. | [`base-list.ts`](../../src/lib/validations/base-list.ts), [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts) |
| Session create | UUID `base_list_id`, `name` 1–100. | [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts) |
| Session complete | Optional positive `total_amount`, `general_notes` up to 1000, `sync_to_base` defaults false. | [`shopping-session.ts`](../../src/lib/validations/shopping-session.ts) |
| Ticket upload | Multipart repeated `files`: 1–5 images, each at most 10 MiB. Service reads optional `group_id` and `store_name`; UI requires a store name, but the service does not apply the full upload Zod schema. | [`uploadTicket`](../../src/lib/server/services/tickets.service.ts), [`UI schema`](../../src/lib/validations/ticket.ts) |
| Ticket group PATCH | `{ "group_id": "UUID" }` or `{ "group_id": null }`; field optional. | [`ticket handler`](../../src/app/api/v1/tickets/[ticketId]/route.ts) |
| Merge items | UUID `base_list_id`, 1–200 `items` entries containing UUID `id` and boolean `merge`; path ticket ID takes precedence. | [`ticket schemas`](../../src/lib/validations/ticket.ts), [`merge handler`](../../src/app/api/v1/tickets/[ticketId]/merge-to-base-list/route.ts) |
| List from receipt | UUID `group_id`, `name` 1–100 and 1–200 UUID `item_ids`; path ticket ID takes precedence. | [`ticket schemas`](../../src/lib/validations/ticket.ts) |
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

The three deprecated v1 aliases emit `Deprecation: true`, `Sunset: Wed, 30 Sep 2026 23:59:59 GMT`, and a successor `Link`.
They still exist after that advertised sunset as of this review. [Open question: agree a revised compatibility/removal
plan and check remaining callers before changing routes or dates.] New clients should use successors; removing existing
handlers is outside this documentation change.

`GET /api/health` is an operational endpoint outside the product versioned envelope. It returns status, timestamp,
API/database checks, and `200` or `503`. See the [deployment checks](../runbooks/deploy.md#publish-and-check).
