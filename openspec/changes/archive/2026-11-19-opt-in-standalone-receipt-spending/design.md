## Context

Spending aggregates eligible trip receipts separately from the older summary fields. Receipt detail and list already use the ticket API.

## Decisions

- Store a boolean defaulting to false on tickets. Eligibility requires both trip references to be null.
- Extend the existing ticket PATCH with a separate spending payload. Apply the ownership and eligibility filters in the write itself. An enabled receipt needs a recorded nonnegative amount. An already enabled receipt can be switched off if it loses its amount.
- Fold opted-in receipts into the receipt aggregation before grouping and comparison. Use the purchase date with upload date as the fallback, along with the current store rules. Trip attachment takes precedence.
- Use a shadcn switch with a state description in the detail. Show the In spending indicator beside the amount in the list when the eligible receipt contributes.
