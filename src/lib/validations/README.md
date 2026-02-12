# Data limits and validation rules

This document summarizes validation limits used across server actions and Zod schemas to prevent abuse (including DoS-style oversized payloads).

- **Source of truth for configurable limits:** `src/lib/config/limits.ts`
- **Last verified against commit:** `0c82a96`

## Configurable limits (`src/lib/config/limits.ts`)

| Constant | Value | Where it is used |
| --- | ---: | --- |
| `MAX_GROUPS_PER_USER` | 10 | Group creation limit in `createShoppingList` |
| `MAX_ITEMS_PER_BASE_LIST` | 250 | Base list item cap in `createBaseListItem`, `mergeTicketItemsToBaseList`, `createBaseListFromTicket`, and shopping-session sync checks |
| `MAX_TICKET_ITEMS_MERGE` | 200 | Ticket merge/create-from-ticket payload limits (`mergeTicketItemsSchema`, `createBaseListFromTicketSchema`) |
| `MAX_SYNC_ITEMS` | 250 | Config-level cap intended for shopping-session sync safeguards |
| `MAX_IMAGES_PER_TICKET` | 5 | Upload payload limit in `uploadTicketSchema` |

## Domain-specific limits

### Groups

- Maximum groups per user: **10**.
- Enforced by: `createShoppingList`.
- Rationale: keeps free-tier usage bounded and avoids unbounded group growth.

### Base lists

- Maximum items per base list: **250**.
- Enforced by: `createBaseListItem`, `mergeTicketItemsToBaseList`, `createBaseListFromTicket`, and `syncSessionToBaseList` capacity checks.
- Protection: prevents both manual and batch operations from exceeding list capacity.

### Ticket operations

- Maximum selected items per merge operation: **200**.
- Maximum selected items when creating a base list from a ticket: **200**.
- Maximum uploaded images per ticket: **5**.
- Enforced by: `mergeTicketItemsSchema`, `createBaseListFromTicketSchema`, and `uploadTicketSchema`.

### Shopping session sync

- Configured sync cap (`MAX_SYNC_ITEMS`): **250**.
- Additional safety check in `syncSessionToBaseList`: **500** (hard-coded backstop currently in action implementation).
- Base list capacity still applies: synced result cannot exceed **250** items in the destination base list.

## Field-level validation limits (Zod)

### String lengths

| Field | Max length |
| --- | ---: |
| Group names | 100 |
| Base list names | 100 |
| Shopping session names | 100 |
| Item names | 200 |
| Notes | 500 |
| General notes | 1000 |
| Unit | 20 |
| Category | 50 |
| Store name | 100 |

### Numeric rules

- `quantity`: minimum **0.1**, maximum **99**, increments of **0.1**.
- `total_amount`: must be positive.
- `sort_order`: integer.

## Security and reliability notes

- Validation is performed server-side; client input is never trusted.
- Zod schemas provide runtime validation and typed inputs.
- Server actions validate `unknown` payloads before business logic.
- Array and collection limits reduce memory and processing abuse risk.
