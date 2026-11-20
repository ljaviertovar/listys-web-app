# Design

## Context

`spending_summary` currently includes completed-trip totals and standalone receipt totals. The API service separately builds a receipt-backed summary, but only queries completed trips for it. Trip receipts are attached through `tickets.shopping_session_id`; the canonical trip states are `active` and `completed`.

## Goals / Non-Goals

**Goals:** Make monthly and all-time spending, receipt count, store/category breakdowns, average, and monthly comparison derive from eligible attached receipts.

**Non-Goals:** Change receipt attachment, OCR validation, trip totals, dashboard presentation, or database records.

## Decisions

- Include receipts attached to an owned active or completed trip, plus receipts uploaded from one of those trips and still awaiting review. A receipt already applied to a list by itself stays outside Spending.
- Use the same receipt-backed aggregation for monthly and all-time scopes, with receipt `created_at` as the period date so active trips are included and all-time has no upper history boundary beyond the existing range mechanism.
- Preserve the existing endpoint and DTO shape where possible; update misleading counts/summary fields only as needed to ensure every displayed spending metric uses the eligible receipt set.
- Prefer the confirmed attachment amount when available. Pending receipts contribute their recorded amount. The OCR line items supply the category breakdown independently of the receipt total.

## Risks / Trade-offs

- [Legacy dashboard fields assume trip totals] → Update their semantics consistently and cover the API summary and card consumers with focused service tests.
- [Active trips may lack a completion timestamp] → Filter monthly eligibility by receipt date, not `completed_at`.

## Migration Plan

No database migration or data rewrite is required. Deploy the service behavior and regression tests together; rollback by reverting the application change.
