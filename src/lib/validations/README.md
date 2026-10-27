# Validation contracts

This directory owns runtime Zod input schemas. Canonical business-limit values live in
[`src/lib/config/limits.ts`](../config/limits.ts); the [limits reference](../../../docs/reference/limits.md) is checked by
`pnpm verify:limits-reference`. Do not maintain a second value table here.

| Module | Responsibility |
| --- | --- |
| `auth.ts` | Email/password form input. |
| `group.ts` | Group names and descriptions. |
| `base-list.ts` | Base-list metadata and item fields. |
| `shopping-session.ts` | Session creation, updates, completion and item fields. |
| `ticket.ts` | UI upload schema, selected-item merge and create-list input. |
| `store.ts` | Store names (create, rename) and the store merge body. |
| `sharing.ts` | Experimental invite options and identifiers. |
| `api/common.ts` | Common UUID route params and session-status query input. |

Route Handlers use `src/lib/api/zod.ts` for JSON/params/query parsing; services also validate domain input. Nested item
creation gets its parent ID from the path. See the [API v1 reference](../../../docs/reference/api-v1.md) for endpoint
shapes, limits and observed statuses.

Current exceptions matter: schemas are generally non-strict Zod objects, and ticket upload's service performs manual
file checks rather than applying the complete UI upload schema. Do not claim every external field is fully validated
or unknown writes rejected solely because a schema exists. Response DTO validation is separate and remains a
[documented gap](../../../docs/reference/implementation-status.md#audit-findings-and-follow-up).

Tests belong in this module's `tests/` folder. Keep server input untrusted and add only schemas needed by actual flows;
follow [AGENTS.md](../../../AGENTS.md) for validation and security requirements.
