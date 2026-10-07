# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday shoppers running a household: families, couples, and roommates. The primary scene is a person standing in a
supermarket aisle with one hand free and interrupted attention; the secondary scene is the same person at home with a
pile of paper receipts, about to rebuild a list they already wrote last week. The job: stop retyping the same shopping
list, and walk the store without forgetting things or duplicating what someone else already bought.

## Product Purpose

Listys turns receipts into reusable household memory. A photographed receipt is extracted into structured items the user
reviews and merges into a **base list**; each base item then accumulates purchase frequency, recency, and average price,
so the next shopping session starts pre-filled and ordered by what this household actually buys. Success is the second
trip being measurably faster than the first without the user configuring anything.

## Positioning

Competing list apps are static CRUD: the user types items, and the app forgets everything between trips. Listys'
mechanism is the loop — receipt in, structured items out, merged into a list that keeps behavioral memory and reorders
itself. The receipt is a signal, not the product; the durable object is a list that is easier to use after every trip.

## Operating Context

- Capture at home: 1–5 receipt photos per upload, OCR runs asynchronously, the user reviews and edits every extracted
  line before anything is saved.
- Merge: extracted items go into a new base list or merge into an existing one, de-duplicated by normalized name.
- Shop: a shopping session is cloned from a base list so the original stays intact; items are checked off live, grouped
  by category, with visible progress; on completion the session can optionally sync changes back into the base list.
- Share: a household group can hold a shared list and a shared shopping session, so several people see the same state.
- Mobile-first and frequently offline-ish: a PWA used in-store, one-handed, on a phone.

## Capabilities and Constraints

- Confirmed and shipped: receipt upload (1–5 images), OCR extraction with a mandatory human review step, base lists
  CRUD, per-item enrichment (`purchase_count`, `first_seen_at`, `last_purchased_at`, `average_price`,
  `normalized_name`), shopping sessions with dynamic ordering and progress, shopping history, groups/invites and shared
  shopping sessions with collaborators.
- Auth is Google OAuth only. There is one account tier; no paid plans, pricing page, or billing exists.
- Terminology that must stay stable: **receipt**, **base list**, **shopping session**, **group**, **item**.
- Explicitly not built: predictive restock alerts or notifications, analytics dashboards, POS integrations.
- PRD-v2 lists real-time multi-user collaboration as an MVP non-goal; the codebase has since shipped sharing and shared
  sessions. Sharing is real and may be shown; it is not the lead promise.

## Brand Commitments

- Name and wordmark: **Listys**. The receipt/check symbol with its blue vertical gradient (`#6EB1FF` → `#3882EC`) is the
  canonical mark and is not recoloured.
- The blue-and-cyan palette recorded in `docs/design/DESIGN.md` is binding: paper-white working surfaces, action blue
  `#2563EB`, scan cyan `#38BDF8` reserved for reading/transforming/syncing.
- Voice: useful, not magical. No "revolutionary", no "effortless", no anthropomorphic AI claims. Action names stay
  stable across button, pending state, and confirmation.
- Marketing copy is English, authored so it can be switched to Spanish without touching layout.
- One primary action across the whole marketing surface: create a free account. No competing CTA, no pricing, no demo
  gate.

## Evidence on Hand

- Real: the product UI itself — receipt upload and OCR review, base lists, an active shopping session with category
  grouping and live progress, shared sessions with collaborator presence. This is the proof the page is allowed to lean
  on, captured from the running app.
- Confirmed claim: the OCR extraction target is 99% accuracy, stated as a product commitment backed by the mandatory
  review step — not as a measured, published benchmark.
- Not real and must never be reused: "1k+ users", "5k+ receipts processed", "4.9/5 App Store rating", "10+ shared
  groups". These were placeholders in the previous landing page and are removed.
- There are no testimonials, customer logos, press mentions, or third-party reviews. Do not fabricate them.

## Product Principles

1. **The list is the product.** Every surface leads back to the next useful list; the receipt is the entry point, not
   the destination.
2. **Intelligence stays invisible.** Frequency, recency, and learned order change what the user sees; they never become
   settings, confidence scores, or model language.
3. **Nothing is saved without review.** Extraction is always followed by a human-editable pass; this is the honest
   counterweight to any accuracy claim.
4. **One hand, interrupted attention.** In-store flows assume a phone, a moving person, and partial focus: large
   targets, glanceable progress, reversible edits.
5. **Say only what is true.** Claims come from shipped capability or supplied data; illustrative content is labelled as
   illustrative.

## Accessibility & Inclusion

WCAG 2.2 AA is the floor (4.5:1 body text, 3:1 large text and essential boundaries). Interactive targets are at least
44×44px in shopping, upload, and mobile navigation. Status is never colour alone. No core task requires horizontal
scrolling at 320px. Reduced-motion users get final states immediately, including a stopped scan seam.
