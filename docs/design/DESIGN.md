---
version: alpha
name: Listys-design-system
description: "The canonical Listys visual language: paper-white working surfaces, blue-ink actions, cyan scan accents, receipt-derived details, and calm mobile-first shopping flows."

meta:
  contentType: Reference
  audience: Product designers and frontend engineers
  goal: Define the visual tokens, component treatments, responsive behavior, motion, content rules, and accessibility constraints required to build Listys consistently.
  productSource: "docs/prd/PRD-v2.md"
  implementationSource: "src/app/globals.css and application-owned components"
  status: "Target canonical; implementation gaps are listed in section 11"

colors:
  ink: "#0F172A"
  ink-soft: "#334155"
  body: "#475569"
  muted: "#64748B"
  faint: "#94A3B8"
  canvas: "#F8FAFC"
  canvas-blue: "#F4F8FF"
  paper: "#FFFFFF"
  paper-sunken: "#F1F5F9"
  primary: "#2563EB"
  primary-strong: "#1D4ED8"
  primary-soft: "#DBEAFE"
  primary-ink: "#1E3A8A"
  scan: "#38BDF8"
  scan-strong: "#0369A1"
  scan-soft: "#E0F2FE"
  collaboration: "#7C3AED"
  collaboration-soft: "#F5F3FF"
  success: "#15803D"
  success-soft: "#F0FDF4"
  warning: "#B45309"
  warning-soft: "#FFFBEB"
  destructive: "#B91C1C"
  destructive-soft: "#FEF2F2"
  selection-bg: "#1E3A8A"
  selection-fg: "#FFFFFF"
  focus: "#2563EB"
  dark-canvas: "#0B1120"
  dark-paper: "#111827"
  dark-raised: "#172033"
  dark-ink: "#F8FAFC"
  dark-body: "#CBD5E1"
  dark-muted: "#94A3B8"
  dark-border: "#334155"
  dark-primary: "#60A5FA"
  dark-scan: "#38BDF8"

typography:
  display:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "clamp(42px, 6vw, 72px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  marketing-heading:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 48px)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  screen-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "clamp(24px, 3vw, 32px)"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  card-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.3
  body-lg:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 450
    lineHeight: 1.65
  body-md:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  ui-md:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
  ui-sm:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
  receipt:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0.01em"
  overline:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
    textTransform: uppercase

rounded:
  none: "0px"
  mark: "4px"
  tag: "6px"
  control: "10px"
  row: "12px"
  card: "16px"
  panel: "20px"
  device: "32px"
  pill: "999px"

spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
  section-mobile: "80px"
  section-desktop: "120px"

shadows:
  control: "0 1px 2px rgba(15, 23, 42, 0.06)"
  card: "0 8px 24px -18px rgba(15, 23, 42, 0.28)"
  raised: "0 20px 50px -28px rgba(30, 58, 138, 0.32)"
  device: "0 36px 80px -32px rgba(30, 58, 138, 0.42)"

motion:
  instant: "100ms"
  fast: "160ms"
  standard: "240ms"
  deliberate: "420ms"
  easing-standard: "cubic-bezier(0.2, 0, 0, 1)"
  easing-enter: "cubic-bezier(0.16, 1, 0.3, 1)"

breakpoints:
  sm: "640px"
  md: "768px"
  lg: "1024px"
  xl: "1280px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    minHeight: "44px"
    padding: "0 {spacing.5}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderColor: "#CBD5E1"
    rounded: "{rounded.control}"
    minHeight: "44px"
    padding: "0 {spacing.5}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    minHeight: "44px"
    padding: "0 {spacing.5}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderColor: "#E2E8F0"
    rounded: "{rounded.card}"
    padding: "{spacing.6}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderColor: "#CBD5E1"
    rounded: "{rounded.control}"
    minHeight: "44px"
    padding: "0 {spacing.3}"
  status-badge:
    rounded: "{rounded.pill}"
    minHeight: "24px"
    padding: "0 {spacing.2}"
  shopping-item:
    backgroundColor: "{colors.paper}"
    borderColor: "#E2E8F0"
    rounded: "{rounded.row}"
    minHeight: "56px"
    padding: "{spacing.3}"
  receipt-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderColor: "#E2E8F0"
    rounded: "{rounded.card}"
    padding: "{spacing.5}"
  app-header:
    backgroundColor: "rgba(255, 255, 255, 0.88)"
    textColor: "{colors.ink}"
    borderColor: "#E2E8F0"
    height: "64px"
  app-sidebar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    borderColor: "#E2E8F0"
    width: "272px"
  bottom-action-bar:
    backgroundColor: "rgba(255, 255, 255, 0.94)"
    borderColor: "#E2E8F0"
    minHeight: "72px"
---

# Listys Design System

## Overview

**Status:** Target canonical. This document owns Listys' visual language and interaction treatment. The current product is
partially aligned; section 11 records the migration work without redefining the target around accidental implementation
details.

**Product premise:** Listys turns receipts into reusable household memory. A receipt is an input signal, not the final
product; the lasting object is a shopping list that becomes easier to use after every trip.

**Audience:** Everyday shoppers, families, roommates, and other small households. The interface must feel immediate to a
person standing in a store with one hand available. Intelligence stays quiet: the product shows a useful order and a clear
result instead of asking users to configure an algorithm.

**Visual thesis:** **paper, ink, and a scan beam.** White working surfaces borrow the familiarity of a paper list; deep navy
provides legible structure; blue is the user's action colour; cyan appears only where Listys is actively reading,
transforming, or synchronizing information. The system should feel precise and optimistic, not financial, clinical, or
overly futuristic.

The source document supplied for this work informed the structure and level of specificity of this specification. Its food
matching concepts, green/lime palette, editorial typography, allergen semantics, and component rules are not Listys
requirements and have not been carried over.

---

## 1. Principles

1. **The list is the product.** Receipts, OCR, history, and metrics should visually lead back to the next useful list. A
   receipt preview may be expressive; list editing and active shopping remain quiet and direct.
2. **Blue means action; cyan means transformation.** Primary blue identifies navigation, selection, focus, and user-driven
   actions. Cyan is reserved for OCR, scanning, live synchronization, and the receipt-to-list story. Neither is decoration.
3. **Paper carries content; canvas creates hierarchy.** Cards and rows sit on a cool canvas. Separation comes from surface
   contrast and hairline borders before shadows. Nested white cards inside white cards are a smell.
4. **Progress must be glanceable.** During a shopping session, checked count, remaining count, and completion progress are
   visible without scrolling. Checked state uses shape, label, and treatment—not colour alone.
5. **Household intelligence is invisible.** Frequency, recency, and learned order influence what users see; the interface
   does not expose model language, confidence theatrics, or configuration the user did not ask for.
6. **One hand, interrupted attention.** The active-shopping path prioritizes 44px targets, sticky actions, short labels,
   resilient loading states, and reversible edits. Marketing may be expressive; shopping may not be distracting.

---

## 2. Brand signature

### 2.1 Receipt-to-list transition

Listys' signature is a **single horizontal scan seam** that connects a receipt to a structured list. In the marketing hero,
it may travel once across the receipt and resolve into aligned list rows. In OCR processing, the same seam can move within
the image frame while status text reports real progress. It must never loop as ambient decoration elsewhere.

The seam is `2px`, cyan at the centre, and fades to transparent at both ends. A soft `8–12px` glow is allowed only on dark
or photographic material. Its accessible meaning comes from adjacent status text such as “Reading receipt” or “Creating
items”; the line itself is `aria-hidden`.

### 2.2 Receipt details

Receipt references are structural, not a theme applied to every component:

- IBM Plex Mono is limited to merchant metadata, amounts, timestamps, OCR previews, and compact overlines.
- Dashed rules may separate receipt totals or image pages. Normal app dividers remain solid.
- A perforated or notched paper edge is permitted on the marketing receipt preview and upload success summary only.
- Barcode texture, torn edges, and thermal-paper noise must not appear on ordinary cards, dialogs, or navigation.

### 2.3 Logo

The existing receipt/check mark is the canonical symbol. Preserve its blue vertical gradient (`#6EB1FF` to `#3882EC`) and
white internal marks. On small surfaces use the symbol alone; pair it with the `Listys` wordmark above 160px of available
width. Do not recolour the mark by feature, add a glow, or place it inside a second rounded container.

---

## 3. Colour

### 3.1 Core palette

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#0F172A` | Primary text, important numerals, dark structural surfaces |
| Paper | `#FFFFFF` | Cards, rows, dialogs, input surfaces |
| Canvas | `#F8FAFC` | Default application and marketing background |
| Action blue | `#2563EB` | Primary actions, current navigation, selection, focus |
| Scan cyan | `#38BDF8` | OCR and synchronization accent only |

The logo gradient is a brand asset, not a general-purpose background gradient. Product surfaces should use flat semantic
colours. The marketing hero may use a restrained canvas wash from `#F8FAFC` to `#F4F8FF`; it must not become a multi-colour
mesh.

### 3.2 Neutrals and hierarchy

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#0F172A` | Headings, item names, primary values |
| `ink-soft` | `#334155` | Secondary headings and icons |
| `body` | `#475569` | Default body and metadata |
| `muted` | `#64748B` | Supporting labels and inactive controls |
| `faint` | `#94A3B8` | Placeholders and non-essential annotations only |
| `paper-sunken` | `#F1F5F9` | Input groups, skeleton tracks, selected neutral rows |
| border | `#E2E8F0` | Card and row hairlines |
| control border | `#CBD5E1` | Inputs and secondary controls |

Do not use `faint` for navigation, form labels, essential timestamps, prices, or error guidance.

### 3.3 Semantic states

| State | Foreground | Surface | Required textual cue |
| --- | --- | --- | --- |
| Completed / success | `#15803D` | `#F0FDF4` | “Completed”, “Saved”, or equivalent |
| Pending / attention | `#B45309` | `#FFFBEB` | “Pending” or the next action |
| Failed / destructive | `#B91C1C` | `#FEF2F2` | Failure reason and recovery action |
| Processing | `#1D4ED8` | `#EFF6FF` | “Reading receipt” or current stage |
| Collaboration | `#7C3AED` | `#F5F3FF` | Person, invitation, or sharing label |

Status meaning is never colour alone. Badges include text; progress includes a numeric or verbal value; selected list rows
include a check mark and an accessible checked state.

### 3.4 Dark mode

Dark mode is supported because the app already follows system preference. It is not a simple inversion:

- Canvas: `#0B1120`; paper: `#111827`; raised surface: `#172033`; border: `#334155`.
- Primary text: `#F8FAFC`; body: `#CBD5E1`; muted: `#94A3B8`.
- Interactive blue becomes `#60A5FA`; scan cyan remains `#38BDF8`.
- Semantic surfaces use low-chroma, dark tinted backgrounds while retaining their labels.
- Images, uploaded receipts, and the logo are not colour-inverted.

No component is complete until its light and dark states have been reviewed. Avoid translucent white cards in dark mode;
they create muddy intermediate greys and unpredictable contrast.

---

## 4. Typography

### 4.1 Families

**Plus Jakarta Sans** carries brand and interface. Its rounded geometry echoes the receipt mark without becoming playful.
Use weights 400, 500, 600, 700, and 800.

**IBM Plex Mono** represents captured source data. Use weights 400, 500, and 600 for receipt previews, totals, dates, OCR
metadata, and compact overlines. It must not be used for paragraphs, form controls, or full shopping lists.

Fallbacks are defined in the machine-readable block. Both families must be loaded through `next/font/google` so assets are
self-hosted and layout shifts are controlled.

### 4.2 Scale and roles

| Role | Spec | Use |
| --- | --- | --- |
| Display | `800 clamp(42px, 6vw, 72px)/1.02`, `-.045em` | Marketing hero only |
| Marketing heading | `750 clamp(32px, 4vw, 48px)/1.1`, `-.035em` | Landing sections |
| Screen title | `700 clamp(24px, 3vw, 32px)/1.16`, `-.025em` | Authenticated page heading |
| Section title | `700 20px/1.25`, `-.015em` | Major in-page section |
| Card title | `650 16px/1.3` | Groups, lists, receipts, history cards |
| Body large | `450 18px/1.65` | Marketing lead |
| Body | `400 15px/1.6` | Default app and marketing copy |
| Body small | `400 13px/1.55` | Supporting metadata |
| UI | `600 14px/1.2` | Buttons, tabs, form labels |
| Receipt | `500 12px/1.55`, `.01em` | Merchant data, dates, item/price source rows |
| Overline | `600 11px/1.2`, `.1em`, uppercase | Actual process stage or data category |

Use tabular numerals for prices, item counts, percentages, quantities, and timestamps. Headings use `text-wrap: balance`;
prose uses `text-wrap: pretty`. Uppercase is restricted to short mono overlines and receipt source material. Shopping
category names use title case in the product UI even when OCR input arrived in capitals.

---

## 5. Shape, borders, and elevation

### 5.1 Radius

The system is gently rounded, not pill-shaped by default.

| Token | Value | Applies to |
| --- | --- | --- |
| `mark` | `4px` | Checkbox, compact quantity tile |
| `tag` | `6px` | Status and category badges |
| `control` | `10px` | Buttons, inputs, selects, menu items |
| `row` | `12px` | Shopping and OCR item rows |
| `card` | `16px` | Cards, dialogs, upload areas |
| `panel` | `20px` | Marketing preview frames, auth panel |
| `device` | `32px` | Marketing phone mockup only |
| `pill` | `999px` | Avatars, progress tracks, compact status capsules |

Do not mix `rounded-lg`, `rounded-xl`, and arbitrary bracket values for equivalent components. Choose the semantic token.

### 5.2 Borders

Use `1px #E2E8F0` for cards and rows, and `1px #CBD5E1` for controls that need a stronger affordance. Dashed borders are
reserved for upload drop zones, empty create-new tiles, and receipt separators. A hover border may shift to
`rgba(37, 99, 235, .35)`; it must not be the only hover feedback.

### 5.3 Elevation

Most surfaces use no shadow or `shadow-card`. `shadow-raised` belongs to dialogs, floating menus, and the primary marketing
preview. `shadow-device` belongs to the hero device frame only. Do not combine rings, borders, and two shadows on an ordinary
card. Hovering a card may move it by at most `-2px` on pointer devices; static information cards do not lift.

---

## 6. Layout

### 6.1 Marketing

The landing page uses a 1280px maximum content width with 20px mobile, 32px tablet, and 48px desktop gutters. Sections use
80px vertical spacing on mobile and 120px on desktop.

The hero is a two-part transformation story, not a centred headline above a collection of floating badges:

```text
desktop
┌──────────────────────────────────────────────────────────────┐
│ logo      Shared lists · How it works · FAQ       Get started│
├──────────────────────────────┬───────────────────────────────┤
│ Receipt in.                  │  receipt  ─scan→  live list   │
│ A smarter list out.          │  one composed product preview │
│ lead + primary action        │                               │
└──────────────────────────────┴───────────────────────────────┘

mobile
┌──────────────────────────┐
│ concise headline + CTA   │
│ receipt                  │
│ ───── scan seam ─────    │
│ structured live list     │
└──────────────────────────┘
```

Only verified product facts appear as claims. Do not publish synthetic app-store ratings, unmeasured OCR accuracy, or user
counts. Limits such as “up to 5 photos” and “250 items per list” are capabilities, not social proof.

### 6.2 Authenticated shell

- Desktop (`lg+`): 272px sidebar, collapsible to 64px; 64px top bar; content on `canvas`.
- Mobile and tablet: no persistent sidebar. A top-left menu opens the existing sheet/drawer. Keep the main action close to
  the bottom edge when the flow depends on it.
- Page content max-width is 1280px. Reading and form columns cap at 720px; active shopping rows cap at 672px.
- Page gutters are 16px mobile, 24px tablet, and 32px desktop.
- Page header is part of the content hierarchy, not a second navigation bar. Title and description sit together; the
  desktop action aligns opposite them.

### 6.3 Active shopping

Active shopping is the densest and most time-sensitive screen:

```text
┌ sticky session header ─────────────────────────────┐
│ List name        12 of 28 · 43%        Shopping ● │
│ ███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├ scrollable items ──────────────────────────────────┤
│ Produce                                           │
│ [ 2 kg ] Apples                              [✓]  │
│ [ 1 ea ] Avocados                            [ ]  │
│ Dairy                                             │
│ ...                                               │
├ sticky safe-area action bar ───────────────────────┤
│ Cancel                                  Complete  │
└────────────────────────────────────────────────────┘
```

The category order follows product data; colour cycling between categories is not allowed. Category structure comes from
heading, spacing, and item counts. Checked items may move below unchecked items, but they must remain reachable and keep
their original content. On completed sessions, the screen becomes a record: destructive and editing controls disappear.

### 6.4 Cards and collections

- One column below `sm`, two columns from `sm`, and three only when a card remains at least 280px wide.
- A card has one dominant destination. Secondary edit/delete actions live in a menu or explicit action cluster and must not
  create nested interactive elements.
- Count, status, and last activity form the metadata line. Avoid oversized decorative icons that displace useful content.
- Empty states occupy the collection region, not the entire viewport. They explain why it is empty and provide exactly one
  primary next step.

---

## 7. Components

### 7.1 Buttons

Primary buttons are action blue with white text, 44px minimum height, and a 10px radius. Use one primary action per region.
Secondary buttons are paper with a visible control border. Ghost buttons are for low-risk toolbar actions. Destructive
buttons become solid red only in the confirmation step; the action that opens a confirmation dialog may remain a red-text
ghost control.

Loading preserves button width, replaces the leading icon with a spinner, and keeps an explicit label such as “Uploading…”
or “Saving…”. Disable the initiating control while work is pending. An icon-only button requires an accessible name and a
44×44px hit area even if its visible icon is 16–20px.

### 7.2 Inputs and forms

Labels sit above controls and remain visible after entry. Placeholder text demonstrates format; it never replaces a label.
Help text precedes validation text in the same reserved area so the form does not jump. Errors identify the field and the
repair: “Name must be 100 characters or fewer,” not “Invalid input.”

Form sections cap at 640–720px. Related quantity and unit controls may share a row, but collapse without reordering on narrow
screens. Dialog forms keep the primary action at the bottom-right on desktop and full-width at the bottom on mobile.

### 7.3 Status badges

OCR badges use these exact labels: `Pending`, `Reading`, `Ready`, and `Failed`. Internal database values such as `processing`
or `completed` may be mapped to user-facing language. The status listener may announce transitions through a polite live
region; repeated polling must not produce repeated announcements.

Badges are compact context, never the only explanation for a failure. A failed receipt also includes a short safe error and
`Try again` when retry is available.

### 7.4 Receipt upload and processing

The upload zone uses a dashed control border, a camera/image glyph, accepted formats, the 10MB per-image limit, and the
current `1–5` image count. Selected images appear in order with thumbnail, filename, remove action, and page number. Removal
does not shift keyboard focus unpredictably.

After submit:

1. `Uploading photos` — determinate only if real byte progress is available.
2. `Waiting to be read` — static pending state.
3. `Reading receipt` — the signature scan seam may animate inside the preview.
4. `Review items` — resolved structured rows; animation stops.
5. `Couldn’t read receipt` — failure summary plus retry or replace-photo action.

Never invent a percentage for asynchronous OCR. A spinner or staged label is more honest.

### 7.5 Receipt card

The list card shows merchant name, upload date/time, item count, assignment/group if present, and status. Merchant name is
the title even when OCR returns none; use “Store not recognized,” not “Unknown.” The receipt/check icon is a supporting glyph,
not a 64px illustration. The entire card may link to detail; action menus must stop propagation and remain separately
focusable.

### 7.6 OCR review row

Each extracted row exposes item name first, then quantity/unit and price. Confidence is not shown in the MVP unless it drives
a user decision. Selected rows use a checkbox, `aria-checked`, a soft blue surface, and a visible check. Price uses tabular
numerals and the locale-aware currency formatter. Edits retain the source image association without exposing internal IDs.

### 7.7 Group and base-list card

A group card answers: what is it, how many lists/items does it contain, who shares it, and where does it lead? Collaborator
avatars overlap by no more than 6px and show at most three people plus a `+N` counter. A base-list card prioritizes list name,
item count, notes, and `Start shopping`. Destructive management is secondary to opening or starting the list.

### 7.8 Shopping item row

Minimum height is 56px. Quantity/unit sits in a fixed-width, soft-blue tile; name and optional note flex; checkbox/action
stays at the trailing edge. Tapping the label toggles the item. Checked state adds a check, changes the accessible state, and
may soften or strike the name; opacity alone is insufficient. Realtime updates must not animate or reorder while the user is
editing that row.

### 7.9 Progress

The progress bar is 8px high, with a `paper-sunken` track and action-blue fill. It is paired with `n of m items` and a
percentage using tabular numerals. Announce meaningful milestones, not every remote update. At 100%, change the adjacent
primary action to `Complete shopping`; do not trigger completion automatically.

### 7.10 Collaboration

Violet is scoped to people and sharing: collaborator avatars, invitations, and presence hints. It never replaces blue for
the primary action. Live state says what happened in plain language (`Maya added milk`) only when attribution is reliable.
Connection loss uses an explicit neutral warning and recovery state; a green dot alone does not promise synchronization.

### 7.11 Navigation

The active sidebar item uses a soft-blue fill and primary-ink text; it does not become a large solid-blue block. Group labels
are visually subordinate and omitted in collapsed mode. The mobile drawer preserves the same order and labels as desktop.
Do not introduce a bottom navigation bar unless product navigation is intentionally restructured across the entire app.

### 7.12 Dialogs, sheets, and menus

Use dialogs for focused creation/confirmation, sheets for mobile navigation or multi-step review, and menus for short
secondary action lists. A dialog has one title, optional description, content, and a consistent footer. Destructive
confirmation names the object being affected and states whether recovery is possible. Focus returns to the trigger on close.

### 7.13 Loading, empty, error, and offline states

- Skeletons mirror the final layout and do not pulse faster than 1.5 seconds.
- Empty states use a line icon, direct explanation, and one next action; no confetti or apologetic copy.
- Errors preserve entered data, describe the repair, and include the request ID only when support can use it.
- Offline active-shopping state keeps local interaction understandable, labels unsynced changes, and does not claim success
  until the server confirms it.
- Toasts confirm background outcomes; they do not replace field errors or persistent failure messages.

---

## 8. Marketing composition

### 8.1 Narrative order

1. Hero: receipt in, useful list out.
2. Three-step flow: capture, review, shop.
3. Shared lists: one household list, synchronized.
4. Product capabilities: reusable lists, learned order, history, receipt memory.
5. FAQ.
6. Final sign-up call to action.

The feature grid is supporting evidence, not the page thesis. Prefer one realistic product preview over many floating badges.
Mock data stays internally consistent across receipt, extracted items, list totals, and shopping progress.

### 8.2 Photography and illustration

Product UI is the primary visual evidence. If lifestyle photography is introduced, it shows the physical act of shopping or
capturing a receipt, never generic food still life. Every photo needs a deliberate crop and a non-image fallback. Icons come
from the installed Hugeicons set; Lucide may remain only in legacy areas until standardized. Do not mix icon families within
one component or feature.

### 8.3 Claims and voice

Listys is useful, not magical. Prefer:

- “Turn a receipt into an editable list.”
- “Keep one list in sync with your household.”
- “Start with the items you buy most.”

Avoid “revolutionary,” “effortless,” “perfect accuracy,” and anthropomorphic AI claims. The action name stays stable across
button, pending state, and confirmation: `Upload receipt` → `Uploading receipt…` → `Receipt uploaded`.

---

## 9. Motion

Motion explains a state change, connects source to result, or confirms direct manipulation.

- Standard hover/focus transitions: 160ms.
- Row insert/remove and panel enter: 240ms with `easing-enter`.
- One-time marketing receipt-to-list transformation: up to 420ms per stage.
- Checkbox completion: scale/check draw no longer than 160ms.
- Reordering after a check waits until the interaction resolves; it must not race the user's finger.

No infinite floating cards, pulsing arrows, decorative blob drift, or perpetual scanning outside real processing. With
`prefers-reduced-motion: reduce`, render the final state immediately, stop the scan seam, remove spatial transforms, and keep
opacity changes below 100ms. State, focus, and completion remain visible without animation.

---

## 10. Accessibility and responsive requirements

### 10.1 Contrast and colour

Use WCAG 2.2 AA as the floor: 4.5:1 for normal text, 3:1 for large text and essential non-text UI boundaries. The palette
was selected so dark semantic text sits on very light semantic surfaces; implementations must still verify opacity-modified
utilities and dark-mode pairs. `scan` cyan is decorative on white and must not carry text. Use `scan-strong` for cyan-family
links or meaningful glyphs on light surfaces.

### 10.2 Interaction

- Interactive targets are at least 44×44px in shopping, upload, and mobile navigation flows.
- Keyboard focus uses a 2px action-blue ring with a 2px offset; do not remove it in favour of colour change alone.
- Drag-and-drop always has a file-picker equivalent. Reordering always has a keyboard or menu alternative.
- Dialogs trap focus, use an accessible title, and restore focus.
- Sticky bottom actions account for `env(safe-area-inset-bottom)`.
- Horizontal scrolling is not required to complete any core task at 320px width.

### 10.3 Images and live updates

- Receipt images use descriptive alternative text including page position, such as “Receipt page 2 of 3”.
- Decorative preview chrome, scan seams, and background textures are hidden from assistive technology.
- OCR and realtime status changes use one polite live region. Errors that block completion may use assertive announcement
  once; retries must not replay stale errors.
- Progress exposes `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and an understandable label.

### 10.4 Language and localization

The current interface is English; all UI copy should be ready for localization. Do not concatenate translated fragments.
Amounts, dates, times, plurals, quantities, and units use locale-aware formatters. Layouts must tolerate 30% text expansion.
Truncation is acceptable for repeated card titles only when the full value is available on focus or in the destination.

---

## 11. Mapping to the codebase

### 11.1 Token implementation

`src/app/globals.css` is the source of runtime semantic tokens. Keep shadcn-compatible names (`--background`, `--card`,
`--primary`, and so on) and add only domain tokens that cannot be expressed semantically, such as `--scan`,
`--collaboration`, and receipt-specific surfaces. Tailwind v4 token registration belongs in the existing `@theme inline`
block. Do not define a second competing colour system in `tailwind.config.ts`.

Recommended mapping:

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #334155;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #dbeafe;
  --accent-foreground: #1e3a8a;
  --destructive: #b91c1c;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #cbd5e1;
  --ring: #2563eb;
  --scan: #38bdf8;
  --scan-strong: #0369a1;
  --collaboration: #7c3aed;
  --radius: 0.625rem;
}
```

The code currently stores these variables as OKLCH. Keeping OKLCH is acceptable and preferred for controlled colour
mixing; the hex values above are the canonical visual targets, not a requirement to change syntax.

### 11.2 Fonts

`src/app/layout.tsx` should eventually replace the current Inter-only configuration:

```ts
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontReceipt = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-receipt',
})
```

Apply both variables to `<html>` and expose `--font-receipt` through Tailwind. Until that migration, Inter is the accepted
fallback; individual components must not load their own web fonts.

### 11.3 Component ownership

| Concern | Current owner |
| --- | --- |
| Buttons, cards, badges, inputs, dialogs | `src/components/ui/` |
| Header, sidebar, page shell, reusable app cards | `src/components/app/` |
| Logo and domain-agnostic shared UI | `src/components/commons/` |
| Group cards and group creation/editing | `src/components/features/shopping-lists/` |
| Base-list cards and item editing | `src/components/features/base-lists/` |
| Active shopping rows, actions, and completion | `src/components/features/shopping-sessions/` |
| Receipt upload, processing, review, and merge | `src/components/features/tickets/` |
| Collaboration avatars and sharing UI | `src/components/features/sharing/` |
| Landing sections | `src/components/marketing/landing-page/` |

Variants belong in existing shared primitives when behaviour and semantics are the same. Domain components own composition;
they must not duplicate button, card, badge, dialog, or input primitives. New application-owned components follow the
repository's `data-testid` and test-location rules.

### 11.4 Current implementation gaps

These are migration notes, not permission for two systems:

1. **Typography:** the app currently loads Inter only. Plus Jakarta Sans and IBM Plex Mono are target roles.
2. **Colour discipline:** marketing, authentication, shopping categories, and statuses use independent violet, pink, green,
   amber, sky, and slate utilities. Consolidate them into the semantic palette above.
3. **Marketing motion:** `hero-mesh`, floating elements, pulsing arrows, and the looping scan line exceed the target motion
   rules. Keep one receipt-to-list transformation and remove ambient loops.
4. **Claims:** current marketing constants include “99% OCR accuracy” and “4.9/5 App store rating.” Remove them unless a
   maintained evidence source exists.
5. **Radius/elevation:** primitives and pages mix base 6px radii, 12px cards, 16px auth controls, and large device radii.
   Normalize by semantic role rather than global search-and-replace.
6. **Icons:** Hugeicons and Lucide coexist. Standardize feature by feature, never by replacing icons without reviewing
   optical size and accessible labels.
7. **Dark mode:** semantic tokens exist, but one-off literal colour utilities and translucent surfaces require a complete
   contrast review.
8. **Copy:** product UI and documentation mix “ticket,” “receipt,” “shopping run,” and “shopping session.” User-facing
   English uses `receipt` and `shopping session`; internal legacy names may remain until safely migrated.

Migrate one vertical flow at a time: primitives and tokens, app shell, active shopping, receipts/OCR, lists and history,
authentication, then marketing. Each flow should be visually complete in light/dark and mobile/desktop before the next begins.

---

## 12. Do and don't

### Do

- Use paper-white surfaces on a cool canvas and blue for user-driven actions.
- Reserve cyan for real scanning, OCR, transformation, and synchronization.
- Keep progress, remaining items, and the completion action visible during shopping.
- Use mono type only when content originates from receipt data or compact system metadata.
- Provide explicit loading, empty, failure, offline, and retry states.
- Test every core flow at 320px, with keyboard only, reduced motion, and dark mode.
- Use real, internally consistent product data in marketing previews.

### Don't

- Turn every card into a receipt or add torn-paper decoration to product UI.
- Use gradients, glows, floating badges, or perpetual motion as filler.
- Cycle arbitrary colours across shopping categories.
- Use cyan, faint grey, or colour alone for meaningful text or state.
- Hide primary mobile actions above the fold or behind an overflow menu.
- Publish performance, accuracy, rating, or adoption claims without maintained evidence.
- Introduce a new radius, shadow, status colour, or icon family without updating this document.
