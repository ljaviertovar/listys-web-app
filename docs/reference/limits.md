# Reference Limits

Reference derived from [`src/lib/config/limits.ts`](../../src/lib/config/limits.ts), which owns these values.
Check parity with `pnpm verify:limits-reference`. A timeout threshold does not establish that a scheduler is deployed.

| Constant | Value | Description |
| --- | ---: | --- |
| `MAX_GROUPS_PER_USER` | 10 | Maximum number of groups a user can create through the API (the web app no longer creates groups) |
| `MAX_STORES_PER_USER` | 50 | Maximum stores per user ("My Stores"); enforced by the `create_store` database function |
| `MAX_ITEMS_PER_BASE_LIST` | 250 | Maximum items in a base list (via any method) |
| `MAX_TICKET_ITEMS_MERGE` | 200 | Maximum items to merge from a single OCR ticket |
| `MAX_SYNC_ITEMS` | 250 | Maximum items to sync from shopping session to base list |
| `RECEIPT_SESSION_ATTACH_WINDOW_HOURS` | 48 | Maximum age of a completed session when attaching a receipt |
| `MAX_IMAGES_PER_TICKET` | 5 | Maximum images per ticket upload |
| `MAX_TICKET_IMAGE_MB` | 10 | Maximum size per receipt photo in MiB (10 × 1024 × 1024 bytes) |
| `MAX_OCR_ATTEMPTS` | 3 | Configured OCR attempt cap; enforcement differs by provider |
| `OCR_PROCESSING_TIMEOUT_MINUTES` | 10 | Configured stuck-processing threshold; not proof of an installed scheduler |

Groups are internal since PRD v3 Phase 2: the web app never asks for, shows or creates one, so this limit only constrains API clients that still call
`POST /api/v1/groups`. The default "My Lists" group of an account (the home of its "Pantry" list and of every list created without a group, see
[implementation status](implementation-status.md#prd-v3-phase-1-delivered)) counts toward `MAX_GROUPS_PER_USER`, so an API client can create
nine more groups. Lists have no per-account limit. Completing a shopping session never fails because of `MAX_ITEMS_PER_BASE_LIST`: checked items that already are in the list
are updated, and new ones that do not fit are skipped and reported (`over_limit_count`).

Stores (PRD v3 Phase 3): creating a store beyond `MAX_STORES_PER_USER` answers `409 LIMIT_EXCEEDED`; merging two stores
frees one place. Store aliases and remembered item links have no separate cap: each receipt assignment or linked line adds
at most one, and item links belong to a list that is itself bounded by `MAX_ITEMS_PER_BASE_LIST`. Linked lines and lines
matched by a remembered link update an existing item, so only the lines that create items count toward that limit when
receipt items are added to a list.

## Likely-needed items

`GET /api/v1/base-list-items?filter=likely_needed` returns at most 10 rows (default 5; valid `limit` is 1–10). An item
needs at least 3 recorded purchases, an average interval of at least 1 day, and elapsed time since its last purchase at
least equal to that interval. The average interval is `(last purchase − first seen) / (purchase count − 1)`. Items older
than 4 intervals or 120 days are excluded, whichever cutoff comes first. The endpoint considers only the caller's owned
lists.

## Spending summary

`GET /api/v1/spending` requires ISO datetimes with offsets in `from` and `to`. The end must be after the start and the half-open range is limited to 92 days. The dashboard requests the visitor's current calendar month; its boundaries are computed in the visitor's time zone. Totals include completed trips with a known total and unattached receipts with a known total. Completed trips without a total are counted separately; attached receipts are not counted again.

The Gemini function enforces its own three-attempt cap. The OpenAI function increments attempts but does not currently
apply that cap; the web retry service also does not enforce it. See the
[implementation gaps](implementation-status.md#prd-v2-acceptance-gaps) before assuming uniform retry guarantees.
