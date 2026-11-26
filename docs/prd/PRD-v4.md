# Listys Product Requirements Document v4

**Status:** Current scope, 2026-11-24. The product owner confirmed that the repository's implemented features are in
production. The requirements below reflect repository evidence. Production configuration and metrics were outside
this review. Next-trip checks (FR-10) were added on 2026-11-26; that confirmation does not cover them, and their
verification is recorded in [implementation status](../reference/implementation-status.md#next-trip-checks-2026-11-26).

**Previous versions:** [PRD v3](PRD-v3.md) records the previous product direction. [PRD v2](PRD-v2.md) records the MVP baseline.

## 1. Product overview

Listys helps household shoppers reuse grocery lists, shop across stores and turn receipt photos into purchase history.
The web app supports the cycle from planning a trip to checking items in the aisle, reconciling receipts and
reviewing actual spending.

### Changes from v3

| Area | Scope in v4 |
| --- | --- |
| Pantry and onboarding | Provision Pantry on the first eligible dashboard visit. Existing accounts without a default can set up Pantry on demand. Get Started tracks the first list, first completed trip and first three receipts. |
| Receipt capture | Use device photos or the in-app document scanner. Review the crop before upload and enter or correct the purchase day on a read receipt. |
| Next-trip checks | Check items on a list as they run out, then start a trip with only those. |
| Active shopping | Keep one active trip per list, with concurrent trips on different lists. Save edits during the trip and surface cross-device conflicts. Estimate the running amount from checked items with known prices. |
| Trip reconciliation | Attach multiple receipts with one per confirmed store. An active trip can continue or complete after attachment. Eligible completed trips accept receipts without an age cutoff. |
| Spending | Show eligible receipt totals by purchase day, with an upload-date fallback and opt-in for standalone receipts. Offer current-month and all-time views. |

## 2. Problem statement

Household shoppers repeatedly buy many of the same items across several stores. Paper receipts record what they paid,
while a static list leaves them to remember where they shop and what each trip cost. Listys connects that history
to the next shopping trip and gives users control over how receipts update lists, trips and spending.

## 3. Goals

- Let shoppers start with a reusable list and complete a trip with minimal setup.
- Use previous purchases to make store selection, item order and estimates useful during shopping.
- Make receipt capture practical on a phone and give users a review step before applying extracted items to a list or trip.
- Give shoppers a spending history based on eligible receipt totals and the day they bought the items.

## 4. Explicit non-goals

- Live store prices, flyers, loyalty or point-of-sale integration.
- Automatic restock notifications, store maps or aisle planning.
- User-facing group management and fully offline shopping. Experimental sharing, invitations and collaborative realtime
  shopping remain outside the core release scope.

## 5. Users

The primary user is a household grocery shopper, often using a phone with intermittent attention in a store.
Shoppers who buy for several purposes can maintain separate lists within the same account.

## 6. Core user journeys

1. **Set up a list.** Sign in, use Pantry or create a list, then add items manually or from a reviewed receipt.
2. **Shop and save a trip.** Check what is running out on a list, if wanted. Start from the list, optionally select a
   store, check or edit items, then complete the trip.
   The app updates purchase memory and keeps the trip in history.
3. **Capture and reconcile a receipt.** Scan or select photos, wait for OCR, confirm the store and review the extracted
   items. Apply selected items to a list or reconcile the receipt with an eligible trip.
4. **Review spending.** Open the dashboard for this month's eligible receipt totals or switch to all time. Correct the
   purchase day or opt a standalone receipt in or out from its detail page.

## 7. Functional requirements

| ID | Requirement and acceptance |
| --- | --- |
| FR-01 | **Lists and Pantry.** Show owned lists in one view. On first eligible dashboard use, provision Pantry for an account without owned lists. Set up Pantry adopts an existing matching list or creates one when the account lacks a default. Adoption preserves the list's items and notes. Confirm deletion and reject it while that list has an active trip. [Default Pantry](../../openspec/specs/default-pantry-list/spec.md) · [List cards](../../openspec/specs/list-cards/spec.md) |
| FR-02 | **Store and price memory.** Propose a store from the receipt. Owners can confirm, rename and merge their stores. Remember confirmed item links when applying receipts to lists. Show usual-store tags based on purchase history or owner choice, average item prices and the latest comparable receipt prices by store. [User stores](../../openspec/specs/user-stores/spec.md) · [Usual-store tags](../../openspec/specs/usual-store-tags/spec.md) · [Store price comparison](../../openspec/specs/store-price-comparison/spec.md) |
| FR-03 | **Trip lifecycle.** Start from a nonempty list, optionally scoped to a store. Prioritize matching items and keep other items available. A list has at most one active trip. Other lists can have their own active trips. Checking items updates the estimate for checked items with known prices. Complete Trip applies purchases to the list and supports completion with unchecked items. [Active-session limit](../../openspec/specs/active-session-limit/spec.md) · [Completion](../../openspec/specs/shopping-session-completion/spec.md) · [Live estimates](../../openspec/changes/archive/2026-11-08-accumulate-active-trip-totals/tasks.md) |
| FR-04 | **Trip edits.** Save item edits during the trip. When two devices edit the same item version, show the conflict and let the user decide whether to reapply or discard the local change. [Active-trip synchronization](../../openspec/specs/active-trip-synchronization/spec.md) |
| FR-05 | **Receipt capture and OCR.** Accept existing photos or let the user scan with the device camera, review the corrected image, adjust corners, keep the original or retake it. Keep the photo picker available when the camera fails. Show processing status and recovery actions. A receipt with zero readable lines is ineligible for review and attachment. [Receipt scanning](../../openspec/specs/receipt-scanning/spec.md) · [Receipt review](../../openspec/specs/receipt-review/spec.md) |
| FR-06 | **Purchase date.** Show the extracted purchase day when available. Use the upload day as a labeled fallback. The owner can enter or correct the day on a read receipt. OCR runs that start after the edit preserve the manual date. Use the saved purchase day for spending. [API reference](../reference/api-v1.md#edit-the-receipt-purchase-date) |
| FR-07 | **Trip receipts.** Keep trip-origin uploads with their trip. Owners can review eligible receipts, confirm line matches, choose additional purchases and attach to an active or completed trip. Active trips can continue or complete after attachment. A receipt can attach once. A trip allows one receipt per confirmed store. Pending receipts do not contribute to the trip's paid total. [Trip receipts](../../openspec/specs/trip-receipts/spec.md) · [Receipt reconciliation](../../openspec/specs/receipt-session-reconciliation/spec.md) |
| FR-08 | **History and dashboard.** Show completed trips, filter them by list and expose receipt status. Show active trips, likely-needed items based on purchase intervals, and recent visits by store. Get Started guides users to their first list, first completed trip and three receipts. [History](../../openspec/specs/shopping-history-by-list/spec.md) · [Dashboard](../../openspec/specs/dashboard-overview/spec.md) · [Get Started](../../openspec/specs/dashboard-get-started/spec.md) |
| FR-09 | **Receipt-backed spending.** Count eligible receipts once: receipts attached to a trip, receipts from an active or completed trip pending review, and standalone receipts the owner opted in with a recorded total. Use the confirmed attachment amount when available. Use the visitor's local calendar month or all time and show spending by store and category. [Spending contract](../reference/api-v1.md#spending-and-store-visits) |
| FR-10 | **Next-trip checks.** Keep list checks on the server until the item is bought. Show each tap at once, save grouped changes in the background and show whether they are saved. With checked items, a trip takes only those, limited to the chosen store; with none, or none for that store, it takes the whole list. Say what the trip includes before it starts. Completing a trip clears the checks of bought items; cancelling keeps them. [Needed items](../../openspec/specs/needed-items/spec.md) |

## 8. Non-functional requirements

- **Integrity.** Starting a trip and cloning its items is atomic. Completion and list updates are transactional.
  Trip item version checks prevent silent overwrites across devices.
- **Access.** Authenticate private operations and enforce owner-scoped access on the server and through RLS.
  Receipt images use protected storage and signed URLs.
- **Recovery.** Show progress during OCR, keep the original photo available for review, and offer retry or replacement
  after a failed read.
- **Mobile use.** The camera and shopping flows support phone screens. See the
  [mobile usability specification](../../openspec/specs/mobile-ui-usability/spec.md).

## 9. Success measures

- Time from account creation to the first completed trip and time spent on repeat trips.
- Share of completed trips with at least one attached receipt.
- Share of receipt uploads that reach review and share of scanned photos that require a retake.
- Share of store suggestions accepted and share of usual-store tags overridden.

These are measurement definitions. Baselines, instrumentation coverage and targets remain open.

## 10. Constraints

- Receipt totals and prices depend on captured receipt data and owner review. Comparison requires compatible units.
- A trip estimate uses known item prices. Spending uses eligible recorded receipt totals. Category breakdowns derive
  from extracted lines and can differ from the paid total.
- Gemini or OpenAI handles OCR according to the configured provider. See [data handling](../privacy/taste-profile.md)
  and [business limits](../reference/limits.md).

## 11. Risks and mitigations

| Risk | Implemented mitigation or known boundary |
| --- | --- |
| Poor photos or OCR errors | Review the crop, keep the original, retake or retry. Review matches before applying items. |
| Duplicate receipt totals or purchases | Spending deduplicates by receipt ID. Attachment is transactional and reconciles already-counted purchases. |
| Concurrent trip edits | Versioned writes detect stale item changes and surface an explicit resolution. |
| OCR already running when the date is changed | Both providers read the manual-date flag at the start of OCR. A concurrent edit can still be overwritten, based on source inspection. [Audit finding](../reference/implementation-status.md#audit-findings-and-follow-up) |

## 12. Delivered scope and verification

This version consolidates the shipped list, store, shopping and history flows with the scanner, purchase-date editing,
multi-store receipt reconciliation, and receipt-backed dashboard. The [implementation reference](../reference/implementation-status.md)
tracks evidence and verification by feature. No additional release commitments are defined here.

## 13. Open questions

- What production baselines and targets should be assigned to the success measures?
- What retention and account export or deletion policies should apply to stored receipts and purchase history?
- When should experimental collaboration enter the core scope?
