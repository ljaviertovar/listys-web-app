# Tasks

## 1. Spending aggregation

- [x] 1.1 Update the spending service to select only valid receipts attached to active or completed trips for monthly and all-time scopes; verify service tests cover both statuses, standalone exclusion, trip-without-receipt exclusion, and receipt date boundaries.
- [x] 1.2 Align total, count, store/category breakdown, average, and comparison values with the eligible receipt set; verify API/service tests assert consistent figures.

## 2. Dashboard integration

- [x] 2.1 Update dashboard consumers and affected copy/empty-state behavior to reflect receipt-based spending; verify dashboard tests cover monthly and all-time summaries.
- [x] 2.2 Update canonical dashboard documentation if its behavior description remains inconsistent; verify the revised spec and implementation describe the same eligibility rule.

## 3. Verification

- [x] 3.1 Run the focused spending and dashboard test suites and OpenSpec validation; verify both pass without running migrations or destructive data operations.

