# Tasks

## 0. Prerequisites

- [ ] 0.1 Confirm `trips-and-receipt-attach` is archived or at least merged into the working branch (its `use-trip-review.ts`, `trip-receipt-review.tsx` and migration `20261103000000_trips_receipt_attach.sql` exist) and that the other session's pieces are committed (`Badge` `tag` / `tag-attention`, `commons/data-line`, `commons/entity-label`, `commons/inline-counter`); verify with `git status` and `ls`, and stop to ask the user if either is missing
- [ ] 0.2 Confirm the shared pieces this change reuses behave as design D6 assumes (`CategoryHeading` props, `ChoiceRow`, `SearchableChoiceList`, `Button` sizes for a 32px quiet text button with a 44px target); note any gap in the task that fills it

## 1. Decision model and review data (pure logic, no UI)

- [ ] 1.1 Extend `readTicketForReview` and the mapping in `use-attach-to-session.ts` to keep `price`, `quantity`, `unit` and `normalized_name` per line, plus session item `quantity` / `unit` in `use-trip-review.ts`; verify with `pnpm typecheck` and an updated `trip-review.test.ts` case that a response with those fields is read and one without them still is
- [ ] 1.2 Add `helpers/line-decision.ts` with `resolveDecision`, `getAvailableChoices` and `toRequestParts` per design D2 (including the unreadable-name rule); verify with unit tests in `attach/tests/` for: a `none` line adds by default; an `alias` line matches by default; leaving out a matched line yields a `null` link; linking to another item yields a link only when it differs from the server's; a name match offers only its own item; an unreadable line is fixed as left out and never in the request
- [ ] 1.3 Add `helpers/plan-quantity-change.ts` (design D4) and verify with unit tests mirroring the cases of `supabase/verification/trips-receipt-attach.sql`: more than usual, less than usual, two lines summed, mixed units → no change, equal quantity → no change, line without quantity counts as 1
- [ ] 1.4 Add `helpers/describe-line-result.ts` that returns the tag (`Remembered`, `Linked by you`, `No price`, `No name`) and the single result line per the spec table; verify with unit tests for each result variant of the spec (new, matches, quantity clause, remembered, linked, no price, already checked, left out, unreadable)
- [ ] 1.5 Rewrite `buildAttachReview` to return `sections`, `counts`, `checkedNotOnReceipt`, `notCheckedNotOnReceipt`, `payload`, `confirmLabel`, `storeMismatch` and `resultingStore` (design D5), using the helpers above; verify with unit tests that the payload for "Batteries default, BAG FEE left out, Milk by name" names only Batteries in `added_item_ids` and nothing else, that counts follow a decision change, and that a left-out matched item moves to the "not on the receipt" lists

## 2. Hook state

- [ ] 2.1 Replace `addedItemIds`, `linkedItems`, `linkingLineId`, `toggleAdded` and `linkLine` in `useTripReview` with `decisions`, `setDecision(lineId, decision)` (dropping the entry when it equals the default), `editingLineId` / `setEditingLineId`; reset decisions on open; keep load, total, phase and `submit` as they are; verify with a hook-level or helper test that closing and reopening restores the defaults and that nothing calls the attach endpoint before `submit`
- [ ] 2.2 Surface `over_limit_count` from the attach summary in the success notice when it is greater than 0 (design Risks); verify with a test of the message helper and by reading that `onAttached` still receives the trip

## 3. Shared UI pieces

- [ ] 3.1 Add the optional `icon` / `tone` / `description` props to `CategoryHeading` / `CategorySection` (existing category usages unchanged) and `variant='card'` to `ChoiceRow` (7.19 A) in the shared layer; verify with `pnpm typecheck`, `pnpm check:native-props` and the existing receipt and shopping-session tests still passing
- [ ] 3.2 Add `StatTile` to `src/components/commons/stat-tile/` with `testId`, icon tone prop and barrel export (design D6); verify with `pnpm typecheck` and by inspecting it in the visual check of group 6
- [ ] 3.3 If 0.2 found no 32px quiet size with a 44px target in `ui/button.tsx`, add it as a `size` there with a comment explaining the target; verify with `pnpm check:native-props`

## 4. Review UI

- [ ] 4.1 Create `trip-review-line-row.tsx` (name, price, `ItemQuantityChip`, tag `Badge`, one grey result line, `Change` button named "Change <name>", no checkbox, no `Link`, no `Change` for unreadable lines) with `data-testid="attach-review-line-<id>"`; verify with one component test that an unreadable line renders no `Change` and a normal line renders exactly one
- [ ] 4.2 Create `trip-review-section.tsx` wrapping `CategorySection` with the section's tone, count and 12px help line (folded for `Not checked, not on the receipt`, omitted when empty) and the six test ids of design D7; verify with a component test of the folded default and the omission of empty sections
- [ ] 4.3 Create `change-line-sheet.tsx` (`SheetDialog`, `RadioGroup` of three `ChoiceRow variant='card'`, `Search trip items` via `SearchableChoiceList`, `Save` disabled until a trip item is chosen, `Cancel`, disabled choices with reason) driven by `getAvailableChoices`; verify with a component test: opens on the current decision, `Save` disabled without an item, `Cancel` leaves the decision unchanged, a name-matched line shows "Add as a new item" disabled
- [ ] 4.4 Rewrite `attach-to-session-dialog.tsx` as a composition: intro line, three `StatTile`s (`Matched`, `New to <list>`, `Left out`) with a polite status region, the sections in spec order, store and `Total paid` unchanged, errors and footer unchanged; remove `ReviewGroup`, `AttachReviewSummary` and the `LinkItemDialog` use from this flow; verify with a component test that leaving a new line out moves it to `Left out` and updates the counters, and that confirm sends the payload of the decisions (mock the endpoint at the boundary)
- [ ] 4.5 Add the copy of the `product-copy-clarity` delta (intro, section help lines, `Change Line` row notes, unreadable-name explanation) as constants next to the dialog; verify by reading each scenario of that delta against the rendered text during the visual check (no assertion on static copy)

## 5. End-to-end and docs

- [ ] 5.1 Update `e2e/ui/receipt-attach.e2e.spec.ts` for the new ids and behaviour: unmatched "Apples" is in `attach-review-section-new` and is added without touching it, then a second run (or line) leaves one out with `Change` and it is not in the trip; verify it type-checks with `pnpm typecheck` and note that it was not run if no loopback Supabase is available (AGENTS.md)
- [ ] 5.2 Update `docs/design/DESIGN.md` per design D10 (7.6 where it differs, 7.18, 7.19 A, 11.4 · 3g) and `docs/reference/implementation-status.md` if it names the old controls; in 11.4 · 3g register as open, one line each, the `Reading`/`Processed` vocabulary (and the `Ready`/`Processed` contradiction in 7.3), the `tag` shape outside the trip review, the ⋯ menus and mono receipt date on cards, and the `Default` chip; verify with `rg "Add as Purchased|Link…|Not in this trip" docs src e2e` returning nothing for this flow
- [ ] 5.3 Update `docs/design/listys-design-system.html` per design D10: the chips section shows the three levels of 7.3 (status with dot, bordered tag with icon and its attention variant, entity without a box) and the product-patterns section gains the trip receipt review (three counters, six sections, a line row with its result and `Change`, the Change Line sheet) using only the tokens and sizes of 7.3, 7.6 and 7.17–7.19; leave the receipt status labels, ⋯ menus and `Default` chip untouched; verify by opening the file in the browser at 390px and 1280px, comparing it with the built screens, and checking that the file still loads without console errors

## 6. Visual validation

- [ ] 6.1 Build a temporary fixture route (per project memory: stubbed Supabase and fake auth cookie, no real data) with the review in these states: loading, mixed receipt with all six sections, a remembered and a linked line, a line with no price, an unreadable line, a quantity change, and the Change Line sheet (current decision, search, disabled choices); inspect at 390px and 1280px with Chrome DevTools against `docs/design/listys-design-system.html` and section 7.6 / 7.18 / 7.19 (stat tiles, section headers, rows, tags, choice rows, sheet), fix discrepancies, then delete the route

## 7. Integration checks

- [ ] 7.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm check:native-props`; all pass
- [ ] 7.2 Run `openspec validate trip-receipt-review-redesign --strict` and fix any reported issue
- [ ] 7.3 Confirm no migration, API or `docs/reference/api-v1.md` change was needed (`git diff --stat` shows none under `supabase/`, `src/app/api/` or `src/lib/api/`), or stop and update the proposal and design if one was

## Workflow follow-up

- Archive `trips-and-receipt-attach` first, then this change, with `/opsx:archive` after review.
- `Reading` / `Processed` receipt labels remain a separate decision (design D9).
- Separate changes to open later, decided with the user on 2026-11-04: receipt status vocabulary; `tag` shape for receipt-row
  and add-to-list labels; ⋯ menus and mono receipt date on receipt, trip and store cards.
