# Tasks

## 1. Shared receipt name

- [x] 1.1 Move `suggestStoreName` and its test from `components/features/stores` to `src/utils/` (`suggest-store-name.ts`, `utils/tests/`), export it from the `@/utils` barrel, update `ticket-store-sheet.tsx` and drop the reexport in `stores/index.ts`; verify `pnpm tsc --noEmit` and the moved test pass.
- [x] 1.2 Replace `getReceiptStoreLabel` in `src/utils/receipt-store-label.ts` with `getReceiptName` (confirmed store → cleaned raw name → "Unnamed Receipt", always suffixed with " Receipt"); remove `UNRECOGNIZED_STORE_LABEL` if nothing else uses it; update `utils/tests/receipt-store-label.test.ts` for: confirmed store, raw name with branch number and capitals ("WALMART #1042" → "Walmart Receipt"), blank/missing names → "Unnamed Receipt", confirmed store winning over raw name; verify with `pnpm test src/utils`.

## 2. Receipt list

- [x] 2.1 In `build-ticket-list-item.ts`, set `title` from `getReceiptName` (read `store_name` as well as `store`), keep `storeName` as the confirmed store only, and drop the "date belongs in the title" comments; add a test next to the tickets helpers covering: confirmed store, raw name only (title uses it, `storeName` null, `storeConfirmed` false), no name ("Unnamed Receipt"), and that the title no longer contains the date; change `uploadedLabel` to day and time ("Uploaded 12 Nov · 10:42", with the year only outside the current one, "Upload time unknown" when there is no date) and cover it with a test that gives two receipts of one store on different days different labels; verify with `pnpm test src/components/features/tickets`.
- [x] 2.2 In `tickets-list.tsx`, remove the store `EntityLabel` from `TicketCard` (keep `NoStoreBadge` for a read receipt without confirmed store, the store filter and its options unchanged) and the now-unused imports; verify lint/typecheck are clean and the filter still lists stores without the word "Receipt".
- [x] 2.3 Update the `ticket-card` store-label references in existing tests and e2e specs, if any (search for `ticket-card-store-`), and verify the affected suites pass.

## 3. Receipt detail

- [ ] 3.1 In `tickets/[ticketId]/page.tsx`, set the header title to `getReceiptName(ticket)` in every state (remove the "Review receipt" title and the date-based fallback), pass the same name to `TicketReview` as `title`; verify in the browser that a review-state receipt, an attached receipt and an unreadable receipt all show the same name as their card.
- [ ] 3.2 In `ticket-store-sheet.tsx` / `ticket-store-card.tsx`, show the "Save as a new store" name field also for a receipt without raw name (empty field, no suggestion), above the list of existing stores; saving goes through the existing create-and-assign flow. Add a behavior test to the store-action tests proving a typed name creates/reuses the store and assigns it, and verify the receipt then titles itself "<name> Receipt" after refresh.

## 4. Other surfaces

- [x] 4.1 Make `ticketTitle` in `build-dashboard-model.ts` use `getReceiptName`; update the dashboard model test expectations for the waiting-receipt line and verify `pnpm test src/components/features/dashboard`.
- [x] 4.2 Make `trip-receipt-details-sheet.tsx` use `getReceiptName` instead of its own store string (including the failed and not-yet-read cases) and update its tests; verify `pnpm test src/components/features/shopping-sessions`.

## 5. Verification

- [x] 5.1 Visually validate with Chrome DevTools (mobile and desktop) the receipt card, receipt detail header in review and attached states, and the store sheet with the new name field, against the Design System; capture screenshots and fix discrepancies.
- [x] 5.2 Run the Design System gate on the changed UI files (`/appds:gate`), then `pnpm lint`, `pnpm tsc --noEmit` and `pnpm test`; verify all pass.
- [x] 5.3 Update affected docs (`docs/` mentions of receipt titles, if any) in the same change and verify no document still describes "Receipt · date" as the title.
