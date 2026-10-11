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
  designSource: "Canvas artifact 'Listys dashboard': Design system v2 (artboards 1/2 and 2/2) and the A1 / A1 mobile boards"

colors:
  ink: "#0F172A"
  ink-soft: "#334155"
  body: "#475569"
  muted: "#64748B"
  faint: "#94A3B8"
  canvas: "#F2F4F7"
  canvas-light: "#F8FAFC"
  canvas-blue: "#F4F8FF"
  paper: "#FFFFFF"
  surface-secondary: "#E9ECF0"
  surface-tertiary: "#DEE2E8"
  divider: "#EEF0F3"
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
  success-tint: "#DCFCE7"
  warning: "#B45309"
  warning-soft: "#FFFBEB"
  warning-tint: "#FEF3C7"
  destructive: "#B91C1C"
  destructive-soft: "#FEF2F2"
  danger: "#DC2626"
  danger-soft: "#FDE2E2"
  danger-tint: "#FEE2E2"
  hero-scrim: "#080D1A"
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
  h1-screen-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "36px (30px on phones, 32px from md, 34-36px on desktop)"
    fontWeight: 700
    lineHeight: 1.11
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.17
    letterSpacing: "-0.025em"
  h3:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.015em"
  h5:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.39
    letterSpacing: "-0.01em"
  card-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 450
    lineHeight: 1.65
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-xs:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.25
  ui-md:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
  chip:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1
  tab:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: "500-600"
    lineHeight: 1
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  receipt-meta:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
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
  checkbox: "6px"
  tag: "8px"
  control: "12px"
  row: "12px"
  field: "16px"
  panel: "20px"
  card: "24px"
  dialog: "28px"
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
  field: "0 0 0 1px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.1)"
  raised: "0 0 0 1px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px -8px rgba(15, 23, 42, 0.12)"
  raised-hover: "0 0 0 1px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px -12px rgba(15, 23, 42, 0.18)"
  overlay: "0 24px 48px -16px rgba(15, 23, 42, 0.35)"
  hero-cta: "0 14px 28px -14px rgba(37, 99, 235, 0.85)"
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
    height: "40px (sm 32px, lg 48px)"
    padding: "0 18px"
  button-hero:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "52px"
    padding: "0 28px"
  button-secondary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 18px"
  button-tertiary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 18px"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 18px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "44px"
    padding: "0 14px"
  chip:
    backgroundColor: "{colors.surface-secondary}"
    rounded: "{rounded.tag}"
    height: "26px"
    padding: "0 10px"
  shopping-item:
    backgroundColor: "{colors.paper}"
    borderColor: "#E2E8F0"
    rounded: "{rounded.row}"
    minHeight: "56px"
    padding: "{spacing.3}"
  receipt-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.5}"
  app-header:
    backgroundColor: "rgba(255, 255, 255, 0.88)"
    textColor: "{colors.ink}"
    height: "64px (60px below lg)"
  app-sidebar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    width: "256px (a 240px floating card plus 8px margins)"
    rounded: "12px"
  mobile-tab-bar:
    backgroundColor: "{colors.paper}"
    height: "80.5px plus the safe-area inset when larger than 18px"
  session-pill:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    minHeight: "72px"
---

# Listys Design System

## Overview

**Status:** Target canonical. This document owns Listys' visual language and interaction treatment. The current product is
partially aligned; section 11 records the migration work without redefining the target around accidental implementation
details. Its visual values follow the **Design system v2** canvas ("soft surfaces", artboards 1/2 and 2/2) and the A1 and
A1 mobile dashboard boards; where the product has not caught up, the gap is listed in section 11.4.

**Product premise:** Listys turns receipts into reusable household memory. A receipt is an input signal, not the final
product; the lasting object is a shopping list that becomes easier to use after every trip.

**Audience:** Everyday shoppers, families, roommates, and other small households. The interface must feel immediate to a
person standing in a store with one hand available. Intelligence stays quiet: the product shows a useful order and a clear
result instead of asking users to configure an algorithm.

**Visual thesis:** **paper, ink, and a scan beam.** White working surfaces borrow the familiarity of a paper list; deep navy
provides legible structure; blue is the user's action colour; cyan appears only where Listys is actively reading,
transforming, or synchronizing information. The system should feel precise and optimistic, not financial, clinical, or
overly futuristic. Surfaces are soft layered greys with white reserved for what is touched or read; cards are separated by
surface and a light shadow, not by outlines.

The source document supplied for this work informed the structure and level of specificity of this specification. Its food
matching concepts, green/lime palette, editorial typography, allergen semantics, and component rules are not Listys
requirements and have not been carried over.

---

## 1. Principles

1. **The list is the product.** Receipts, OCR, history, and metrics should visually lead back to the next useful list. A
   receipt preview may be expressive; list editing and active shopping remain quiet and direct.
2. **Blue means action; cyan means transformation.** Primary blue identifies navigation, selection, focus, and user-driven
   actions. Cyan is reserved for OCR, scanning, live synchronization, and the receipt-to-list story. Neither is decoration.
3. **Paper carries content; canvas creates hierarchy.** Cards and rows sit on a cool grey canvas. Separation comes from
   layered surfaces (canvas, white paper, secondary grey) and a soft shadow, not from borders. Nested white cards inside
   white cards are a smell: nest grey inside white instead.
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
| Ink (`foreground`) | `#0F172A` | Primary text, important numerals, dark structural surfaces |
| Paper (`surface`) | `#FFFFFF` | Cards, rows, dialogs, menus, elevated inputs |
| Canvas (`background`) | `#F2F4F7` | Application background |
| Surface secondary | `#E9ECF0` | Default secondary and tertiary buttons, chips, filled inputs, tracks, segmented controls |
| Surface tertiary | `#DEE2E8` | Hover of a secondary surface, highlighted or selected content |
| Action blue (`accent`) | `#2563EB` | Primary actions, focus, selection |
| Action blue strong | `#1D4ED8` | Hover of primary, blue text on grey, the current navigation item |
| Scan cyan | `#38BDF8` | OCR and synchronization accent only |
| Danger | `#DC2626` | Solid destructive button (hover `#B91C1C`) |
| Danger soft | `#FDE2E2` | Destructive icon tile and soft destructive button (hover `#FECACA`) |
| Divider | `#EEF0F3` | Separators between rows inside a card and between Up Next entries |
| Hero scrim | `#080D1A` | Veil over the hero photo: 93% to 86% top-down on phones; 95%, 88%, 45% left to right from `md` |

The logo gradient is a brand asset, not a general-purpose background gradient. Product surfaces should use flat semantic
colours. The exceptions are the highlight layer on the hero call to action and the raised tab-bar action (section 7.1) and
the blue-to-blue progress fill on the dark hero. The marketing hero may use a restrained wash from `#F8FAFC` to `#F4F8FF`;
it must not become a multi-colour mesh.

### 3.2 Neutrals and hierarchy

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#0F172A` | Headings, item names, primary values |
| `ink-soft` | `#334155` | Secondary headings, icons, inactive navigation labels |
| `body` | `#475569` | Default body and metadata |
| `muted` | `#64748B` | Supporting labels, descriptions, inactive controls |
| `faint` | `#94A3B8` | Placeholders and non-essential annotations only |
| `surface-secondary` | `#E9ECF0` | Input groups, skeleton and progress tracks, selected neutral rows |
| `divider` | `#EEF0F3` | Row separators inside cards (inset), table row rules |
| nested-list rule | `#E2E8F0` | The 2px rule beside a group's nested lists |
| outline ring | `#D5DAE1` | The 1px inset ring of the outline button |

Cards and rows do not use hairline borders. Field rings are the shadows in section 5.3. The legacy `#E2E8F0` and `#CBD5E1`
borders still exist in the code and are tracked in section 11.4.

Do not use `faint` for navigation, form labels, essential timestamps, prices, or error guidance.

### 3.3 Semantic states

| State | Foreground | Tinted surface | Required textual cue |
| --- | --- | --- | --- |
| Completed / success | `#15803D` | `#F0FDF4` (counters and deltas `#DCFCE7`) | "Completed", "Saved", or equivalent |
| Pending / attention | `#B45309` | `#FFFBEB` (counters `#FEF3C7`) | "Pending" or the next action |
| Failed / destructive | `#B91C1C` | `#FEF2F2` (deltas `#FEE2E2`) | Failure reason and recovery action |
| Processing | `#1D4ED8` | `#EFF6FF` | "Reading receipt" or current stage |
| Collaboration | `#7C3AED` | `#F5F3FF` | Person, invitation, or sharing label |

Status chips sit on surface secondary (`#E9ECF0`) with an icon and coloured text; the tinted surfaces above are for counters,
deltas, icon tiles and alerts. Status meaning is never colour alone. Badges include text; progress includes a numeric or
verbal value; selected list rows include a check mark and an accessible checked state.

### 3.4 Dark mode

Dark mode is supported because the app already follows system preference. It is not a simple inversion:

- Canvas: `#0B1120`; paper: `#111827`; raised surface: `#172033`; border: `#334155`.
- Primary text: `#F8FAFC`; body: `#CBD5E1`; muted: `#94A3B8`.
- Interactive blue becomes `#60A5FA`, and the text on it (`primary-foreground`) becomes ink `#0F172A`: white on `#60A5FA` is
  about 2.5:1, ink is about 7:1. Scan cyan remains `#38BDF8`.
- Semantic surfaces use low-chroma, dark tinted backgrounds while retaining their labels.
- Images, uploaded receipts, and the logo are not colour-inverted.

No component is complete until its light and dark states have been reviewed. Avoid translucent white cards in dark mode;
they create muddy intermediate greys and unpredictable contrast.

---

## 4. Typography

### 4.1 Families

**Plus Jakarta Sans** carries brand hierarchy and action UI: display text, headings, card titles, buttons, and list names.
Its rounded geometry echoes the receipt mark without becoming playful. Use weights 500, 600, 700, and 800.

**Inter** carries reading and input surfaces: paragraphs, helper text, form content, and dense list data. Its neutral shapes
keep mobile shopping flows legible at a glance. Use weights 400, 500, 600, and 700.

**IBM Plex Mono** represents captured source data. Use weights 500 and 600, with tabular numerals, for receipt previews,
ids, totals, dates, OCR metadata, and compact overlines. It must not be used for paragraphs, form controls, or full shopping lists.

Fallbacks are defined in the machine-readable block. All three families must be loaded through `next/font/google` so assets
are self-hosted and layout shifts are controlled.

### 4.2 Scale and roles

| Role | Spec | Use |
| --- | --- | --- |
| Display | `800 clamp(42px, 6vw, 72px)/1.02`, `-.045em` | Marketing hero only |
| Marketing heading | `750 clamp(32px, 4vw, 48px)/1.1`, `-.035em` | Landing sections |
| h1 (screen title) | `700 36px/1.11`, `-.03em` | Authenticated page heading; 30px (`/1.17`, `-.025em`) on phones, 32px from `md`, 34-36px on desktop |
| h2 | `700 30px/1.17`, `-.025em` | Hero titles |
| h3 | `700 24px/1.25`, `-.02em` | Session and list names |
| h4 (section title) | `600 20px/1.33`, `-.015em` | Section titles and "Up Next" from `md`; the dashboard sets them at `/1.39`, `-.01em`. On phones they are `h2` elements set at the h6 size (`600 16px/1.5`, `-.005em`) |
| h5 | `600 18px/1.39`, `-.01em` | Sub-sections |
| h6 (card title) | `600 16px/1.5`, `-.005em` | Groups, lists, receipts, history cards |
| Body large | `450 18px/1.65` | Marketing lead |
| Body | `400 16px/1.75` | Default app and marketing copy |
| Body small | `400 14px/1.5` | Secondary text, table cells, navigation and sidebar items |
| Body extra small | `400 12px/1.25` | Captions, helper text and fine print |
| Label | `600 14px/1` (Plus Jakarta Sans) | Buttons, tabs, form actions |
| Chip | `600 12.5px/1` (Inter) | Status chips and the date pill |
| Tab | `500-600 11.5px/1` (Inter) | Tab-bar labels |
| Mono | `500 14px/1.5` | Ids, dates, amounts |
| Receipt meta | `500 12px/1.4`, `.01em` | Row metadata under titles: merchant, dates, item counts |
| Overline | `600 11px/1.2`, `.1em`, uppercase | Actual process stage or data category |

Use tabular numerals for prices, item counts, percentages, quantities, and timestamps. Headings use `text-wrap: balance`;
prose uses `text-wrap: pretty`. Uppercase is restricted to short mono overlines and receipt source material. Shopping
category names use title case in the product UI even when OCR input arrived in capitals.

---

## 5. Shape, borders, and elevation

### 5.1 Radius

Medium (12px) is the radius of components, large (16px) of form fields, 24px of cards and 28px of dialogs; the full pill is
only for avatars, switches and progress bars.

| Token | Value | Applies to |
| --- | --- | --- |
| `checkbox` | `6px` | Checkbox |
| `tag` | `8px` | Chips, the date pill, small tiles in lists |
| `control` / `row` | `12px` | Buttons at every size, rows, menu items, icon tiles, avatars of groups and stores |
| `field` | `16px` | Inputs, selects, one-time-code cells, the raised tab-bar action |
| `panel` | `20px` | Action menus, the phone session pill |
| `card` | `24px` | Cards, hero surfaces, upload areas |
| `dialog` | `28px` | Dialogs |
| `device` | `32px` | Marketing phone mockup only |
| `pill` | `999px` | Person avatars, switches, progress tracks |

Do not mix `rounded-lg`, `rounded-xl`, and arbitrary bracket values for equivalent components. Choose the semantic token.

### 5.2 Borders

Cards, rows, and menus have no border: separation comes from the surface (canvas, paper, secondary grey) and the shadows in
section 5.3. Use `divider` (`#EEF0F3`) for separators inside a card and the 2px `#E2E8F0` rule beside nested lists. The
outline button has a 1px inset ring (`#D5DAE1`). Dashed borders are reserved for upload drop zones, empty create-new tiles,
and receipt separators. A hover state may shift a surface to `surface-tertiary` or `#F2F4F7`; a border colour change must
not be the only hover feedback.

### 5.3 Elevation

Three levels: **flat** (a secondary grey surface, no shadow), **raised** (white surface with the `raised` shadow: cards and
sections) and **overlay** (dialogs and floating menus). Elevated fields use the `field` shadow, and filled fields have none.
Section cards deepen to `raised-hover` on hover; static information cards do not move. The hero call to action lifts 1px on
hover with a deeper glow. `shadow-device` belongs to the marketing hero device frame only. Do not combine rings, borders,
and extra shadows on an ordinary card.

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

- Desktop (`lg+`): a floating 240px sidebar card (256px with its margins) that the top-bar trigger or Ctrl/Cmd+B hides
  completely; 64px top bar on the page ground; content on `canvas` (`#F2F4F7`), which also shows around the sidebar.
- Mobile and tablet (below `lg`): no persistent sidebar. A 60px top bar holds the logo and the account button (Profile,
  Account and Sign Out live in that menu); navigation is a bottom tab bar (see 7.11). Keep the main action close to the
  bottom edge when the flow depends on it.
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

### 6.5 Dashboard and phone shell (design A1)

The dashboard and the phone shell follow the A1 and A1 mobile boards of the canvas. Their values take precedence over the
generic scale on this surface and live in `src/components/features/dashboard/helpers/dashboard-styles.ts` and
`src/components/app/mobile-tab-bar.tsx`.

**Phone shell** (below `lg`):

| Piece | Spec |
| --- | --- |
| Header | 60px (64px from `lg`), white with a bottom hairline; logo 30px plus the "Listys" wordmark (Plus Jakarta Sans 700 19px, `-.02em`); a 44x44 account button with a 34px initials avatar on `#DBEAFE`. No menu button: Profile, Account and Sign Out live in the account menu |
| Tab bar | See section 7.11 |
| Session pill | Only while a trip runs: 72px high, 20px radius, `#0F172A`; a 40px progress ring with a green dot, the trip name and "n of m - p%", and a 44px primary "Continue". It floats 10px above the tab bar with 12px side insets, stays visible next to the hero's own button, and the raised tab-bar action overlaps it |
| Content | 16px gutter, 20px above the greeting, 40px below the last card, plus 72px while the pill is shown; surfaces pinned to the bottom edge sit above the tab bar (`ABOVE_MOBILE_TAB_BAR`) |

**Hero.** A 24px-radius photo surface under the `hero-scrim`. One blue 52px button does the obvious thing: "Continue
shopping" for a running session, "Start shopping" for the most overdue list, or "Upload receipt" for an account without
lists (44px on phones, 52px from `md`). A running trip shows the "Shopping now" chip, the group and list, a progress bar
(8px, white 16% track, `#60A5FA` to `#3B82F6` fill) with `n of m items - p%` in mono, and the collaborators (24px initials
on pastel blue, pink and green, overlapping by 7px, with a 2px near-black ring). Without a session the hero shows the "No
shopping session in progress" chip, the quick-start list shortcuts (36px high at every width) and the last trip
in mono. A new account sees only the title "Start with a receipt", its explanation, the button and a mono note.

**Sections** (Shopping List Groups, Receipts, Shopping History):

| Piece | Spec |
| --- | --- |
| Title row | `h2` 20px / 600 / 1.39 / `-.01em` and, on the right, a "View all" ghost link (blue 700, 600, 12px radius, hover `#E9ECF0`) 12px above the card. 32px high with a 12px label on phones; 40px and 14px from `md` |
| Card | White, 24px radius, 10px padding, `raised` shadow, no border; the shadow deepens on hover |
| Row | 12px radius, `10 8` padding, 12px gap, 36px icon tile (12px radius) in the 50-level tint, 14px / 600 title, mono 12px / 500 metadata in `muted` (may wrap), hover `#F2F4F7` |
| Tile tints | Groups `#EFF6FF` / `#2563EB`, receipts `#ECFEFF` / `#0E7490`, history `#F0FDF4` / `#15803D`; 24px tile (8px radius) for lists, 32px (10px radius) for groups |
| Group and lists | A group row plus its lists, indented 24px with a 2px `#E2E8F0` rule; each list ends in a grey "Start" button (32px, `#E9ECF0`, 12px radius, 13px / 600). Preview: two groups of up to three lists |
| Receipt status | A 14px icon plus the word, Plus Jakarta Sans 700 12px, no chip: Completed `#15803D`, Processing `#B45309`, Failed `#B91C1C`; `divider` rules between rows (inset 8px). Preview: three receipts |
| History | Mono 13.5px / 600 total on the right. Preview: three trips |
| Empty | Minimum 172px, a 56px tile (16px radius) in the 100-level tint (blue `#DBEAFE` / `#1D4ED8`, cyan `#CFFAFE` / `#0E7490`, green `#DCFCE7` / `#15803D`), a two-line 13.5px explanation in `muted` (max 280px) and one primary button ("New group", "Upload Receipt"; History has none). The button is 32px with a 12px label on phones and 44px with 14px from `md` |

**Up Next.** One white card (24px radius, 6px padding) of up to three rows: 64px high, 14px radius, a 40px tile (12px
radius, 100-level tint with 700 icon: amber for a receipt waiting, red for one that failed, blue for a list not shopped for
a while), a 14px / 600 title, a 12.5px `muted` detail, an 18px chevron in `faint`, and `divider` rules inset 64px left and
12px right. The whole row is the link; the title has no "View all". Hover is `#F2F4F7` without lifting. The stacked variant
with a tertiary action button is not used on the dashboard.

**Greeting.** A white 28px date pill (8px radius, a hairline ring, 12.5px / 600, a sun icon) in the visitor's own locale,
the h1 with the name, and one line of context in `muted`.

**Failure.** If any of the dashboard's data fails to load, the page shows an error with "Try again" instead of the dashboard:
a failed request must not look like an empty account. The photo behind the heroes is a `next/image` (`HeroSurface`).

**Sizes that change with the viewport:**

| Element | Phones | From `md` / `lg` |
| --- | --- | --- |
| Page title | 30px | 32px (`md`), 34-36px (desktop) |
| Hero button | 52px; new-account "Upload receipt" 44px | 52px |
| Quick-start chips | 36px / 12.5px | 36px / 12.5px |
| Empty-state button | 32px / 12px | 44px / 14px |
| "View all" | 32px / 12px | 40px / 14px |
| Header | 60px | 64px (`lg`) |
| Tab bar and session pill | Shown | Hidden (`lg`) |
| Header "Upload Receipt" | Hidden | Shown (`lg`) |

---

## 7. Components

### 7.1 Buttons

All buttons have a 12px radius at every size. Use one primary action per region; secondary for supporting actions with a
blue tint; tertiary (neutral) for repeated actions; danger only in confirmations.

| Variant | Surface and text | Hover |
| --- | --- | --- |
| Primary | `#2563EB`, white | `#1D4ED8` |
| Secondary | `#E9ECF0`, `#1D4ED8` | `#DEE2E8` |
| Tertiary | `#E9ECF0`, ink | `#DEE2E8` |
| Outline | Transparent, ink, 1px inset ring `#D5DAE1` | `#F2F4F7` |
| Ghost | Transparent, ink | `#E9ECF0` |
| Danger | `#DC2626`, white | `#B91C1C` |
| Danger soft | `#FDE2E2`, `#B91C1C` | `#FECACA` |

| Size | Height | Padding and label |
| --- | --- | --- |
| `sm` | 32px | 0 14px, 13px, 6px gap |
| `md` (default) | 40px | 0 18px, 14px / 600, 8px gap |
| `lg` | 48px | 0 24px, 16px |
| `hero` | 52px | 0 28px, Plus Jakarta Sans 700 16px, 10px gap, 18px icon |
| Icon only | 40x40 | 18px icon; the raised tab-bar action is 58x58 with a 16px radius |

Touch: `lg` for the main actions on phones; `md` by default; `sm` only inside dense rows that provide a 44px hit area.
The visual height is not the hit area: every control keeps at least a 44x44px target (section 10.2).

The **hero call to action** and the **raised tab-bar action** carry a highlight layer: a top-lit gradient, white at 18-20%
fading to transparent, over `#2563EB`, with the blue glow shadow (`hero-cta`) and, for the hero, a 1px lift on hover. They
exist once per screen. Standard primary buttons are flat `#2563EB`.

States: hover as in the table; focus is a 2px white gap plus a 2px `#2563EB` ring; pressed scales to 97% on the hover colour;
disabled is 45% opacity; loading keeps the width, shows a spinner and an explicit label such as "Saving..." and disables the
control.

Destructive buttons become solid red only in the confirmation step; the action that opens a confirmation dialog may remain a
red-text ghost control. An icon-only button requires an accessible name and a 44x44px hit area even if its visible icon is
16-20px.

### 7.2 Inputs and forms

Labels sit above controls and remain visible after entry. Placeholder text demonstrates format; it never replaces a label.
Help text precedes validation text in the same reserved area so the form does not jump. Errors identify the field and the
repair: “Name must be 100 characters or fewer,” not “Invalid input.”

Fields come in two styles: **elevated** (white, 16px radius, 44px high, Inter 15px, the `field` ring and shadow, on the grey
canvas) and **filled** (`#E9ECF0`, no shadow, inside a white card). Controls use action blue for the active state: a 20px
checkbox (6px radius), a 44x26 switch, a 20px radio, a 24px slider track on `#E9ECF0`, a segmented control (`#E9ECF0`,
14px radius, the selected segment white), and 44x48 one-time-code cells.

Form sections cap at 640–720px. Related quantity and unit controls may share a row, but collapse without reordering on narrow
screens. Dialog forms keep the primary action at the bottom-right on desktop and full-width at the bottom on mobile.

### 7.3 Status badges

OCR badges use these exact labels: `Pending`, `Reading`, `Ready`, and `Failed`. Internal database values such as `processing`
or `completed` may be mapped to user-facing language. The status listener may announce transitions through a polite live
region; repeated polling must not produce repeated announcements.

The running-session badge reads `Shopping` (the dashboard hero chip reads `Shopping now`) with a subtly pulsing green dot to
reinforce its active state. The pulse stops when reduced motion is preferred. It has an `on-dark` tone for photo and ink
surfaces such as the dashboard banner: a 26px pill with a 12% white fill and a 7px dot. Status chips are 26px high with an
8px radius, a `#E9ECF0` surface, an icon and a coloured 12.5px / 600 label; counters are 22px high with a 12px label, and
deltas and "New" use the tinted success and danger surfaces.

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
avatars show at most three people plus a `+N` counter. People are circles (40px with a 3px white ring, overlapping by 10px,
soft radial gradients or initials on `#E9ECF0`); groups and stores are 12px-radius squares. A base-list card prioritizes list name,
item count, notes, and `Start shopping`. Destructive management is secondary to opening or starting the list.

### 7.8 Shopping item row

Minimum height is 56px. Quantity/unit sits in a fixed-width, soft-blue tile; name and optional note flex; checkbox/action
stays at the trailing edge. Tapping the label toggles the item. Checked state adds a check, changes the accessible state, and
may soften or strike the name; opacity alone is insufficient. Realtime updates must not animate or reorder while the user is
editing that row.

### 7.9 Progress

The progress bar is 8px high, with a `surface-secondary` track and action-blue fill (on the dark hero: a white 16% track and a
`#60A5FA` to `#3B82F6` fill). It is paired with `n of m items` and a
percentage using tabular numerals. Announce meaningful milestones, not every remote update. At 100%, change the adjacent
primary action to `Complete shopping`; do not trigger completion automatically.

### 7.10 Collaboration

Violet is scoped to people and sharing: collaborator avatars, invitations, and presence hints. It never replaces blue for
the primary action. Live state says what happened in plain language (`Maya added milk`) only when attribution is reliable.
Connection loss uses an explicit neutral warning and recovery state; a green dot alone does not promise synchronization.

### 7.11 Navigation

The active sidebar item sits on the secondary-button surface (`#E9ECF0`) with blue text (`#1D4ED8`, 600); it does not become a
solid-blue block. Entries are 36px high on one line with an 8px radius, an 18px icon (slate; blue on the current page) and a
14px label (inactive `#334155`, 400; current 600); counts are 22px chips. Group titles are 14px semibold ink, not uppercase.

Below `lg` the sidebar is replaced by a bottom tab bar (approved design "A1 mobile"): five equal slots, Dashboard, Lists, a
raised 58px **Upload Receipt** button in the middle, Receipts and History.

| Piece | Spec |
| --- | --- |
| Bar | White, a hairline on top and a soft upward shadow; padding `4 8 18` (the bottom grows to the device's safe-area inset when larger); pinned to the bottom edge of the screen; hidden from `lg` |
| Content clearance | The scrolling content carries a bottom padding equal to the bar's height (80.5px) so its last row stays reachable; surfaces pinned to the bottom edge sit above it (`ABOVE_MOBILE_TAB_BAR` in `src/components/app/helpers/mobile-tab-bar-layout.ts`) |
| Tab | 58.5px high (every tab, even when none is current, so the bar never changes height), 24px icon at stroke 1.5, 11.5px label, 12px radius |
| Current tab | `#E9ECF0` surface, `#1D4ED8` text, weight 600 and a 4px dot under the label (`aria-current="page"`); inactive tabs are `slate-500`, weight 500 |
| Raised action | 58x58, 16px radius, primary with the highlight layer, a 6px white ring plus the blue glow, 24px above the bar edge, 26px icon, `aria-label` "Upload a receipt" |

The desktop sidebar follows the A1 desktop board (the shadcn floating sidebar): a white card with a 12px radius and a
hairline ring, 240px wide inside 8px margins on the page ground. It opens with the brand (the Listys mark at 32px, "Listys" in
Jakarta 600 14 and "Shared shopping lists" in 12px muted, a 64px block that links home), then the three groups (Shopping,
Management, Settings), each with its title and its entries inset by 6px. Receipts carry an amber count pill (how many are still
waiting for a list) and Shopping List Groups a neutral one (how many groups); a count of zero shows nothing. The foot holds the
running session as a card (10px radius, "Shopping now", `done/total`, a 6px progress bar) and the author credit. The sidebar has
no icon mode: the trigger hides it entirely and the page takes the full width (the open state is kept in a cookie). The
desktop top bar is 64px on the page ground, with no border: the sidebar trigger (36px, 8px radius), a 16px hairline and the
"Section › Page" breadcrumb at the left (pages outside the navigation have none; only the current page is highlighted, medium
weight), and at the right a quiet "Install app" text button (when installation is possible), a 24px hairline and the account
pill (34px initials avatar, name, email and a chevron from `lg`; the avatar alone below it). The counts, progress and account
load in the browser, only while the sidebar is open, and again on each page change.

### 7.12 Dialogs, sheets, and menus

Use dialogs for focused creation/confirmation, sheets for mobile navigation or multi-step review, and menus for short
secondary action lists. A dialog has one title, optional description, content, and a consistent footer. Destructive
confirmation names the object being affected and states whether recovery is possible. Focus returns to the trigger on close.

Dialogs are white with a 28px radius and the `overlay` shadow: a 22px icon, a Plus Jakarta Sans 700 17px title, a 28px
tertiary close button, a grey 14px body, and a footer of a tertiary "Cancel" and the confirming button (danger for deletes).
Action menus are white with a 20px radius, 8px padding and a floating shadow; each item is at least 52px high with a title, a
short description and an optional shortcut, and a "Danger zone" group closes the menu.

The account menu (approved design "A1 mobile · Menú de usuario", `features/auth/user-nav.tsx`) is such a menu, anchored to the
avatar: 263px wide (at most the viewport minus 8px margins), right-aligned to the avatar, 4px under the 60px header. It opens with
the identity (a 44px avatar, the name in Jakarta 700 15 and the email in 13px muted, ellipsised) and a divider, then, on phones
only, Dashboard, Profile and Account as 52px rows (14px radius) made of a grey `#F2F4F7` 36px icon tile and a regular 14px title, with
no help lines; desktop has them in the sidebar. Sign out closes the menu as a full-width 44px tertiary
button (`#E9ECF0`, 12px radius, Jakarta 600 14, 18px icon), neutral because it destroys nothing. On phones the open avatar sits on
a `#E9ECF0` circle and a `slate-900` scrim at 40% dims the page from the header down, tab bar included (it is portalled to the
body because the header's backdrop blur would otherwise contain a fixed child); the scrim does not exist from `lg`.

Alerts (22px radius) put the colour in the icon and the title and keep the body grey. Every error offers its way out (Retry,
with concrete recovery steps); every process shows a spinner with honest text, never an invented percentage.

### 7.13 Loading, empty, error, and offline states

- Skeletons mirror the final layout and do not pulse faster than 1.5 seconds.
- Empty states use a tinted icon tile, a direct explanation, and one next action; no confetti or apologetic copy
  (dashboard anatomy in section 6.5).
- Errors preserve entered data, describe the repair, and include the request ID only when support can use it.
- Offline active-shopping state keeps local interaction understandable, labels unsynced changes, and does not claim success
  until the server confirms it.
- Toasts confirm background outcomes; they do not replace field errors or persistent failure messages.

### 7.14 Data tables

A table has a header band on `surface-secondary` (44px, 12.5px `muted` labels) and a white body that wraps it. Rows are at
least 60px high with 18px side padding and `divider` rules. Row actions are icon-only buttons; delete uses danger soft. A
toolbar above shows the title with a count chip and tertiary `sm` filters.

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

No infinite floating cards, pulsing arrows, decorative blob drift, or perpetual scanning outside real processing. The
running-session status dot is a status-specific pulse exception. With `prefers-reduced-motion: reduce`, render the final
state immediately, stop the status pulse and scan seam, remove spatial transforms, and keep opacity changes below 100ms.
State, focus, and completion remain visible without animation.

---

## 10. Accessibility and responsive requirements

### 10.1 Contrast and colour

Use WCAG 2.2 AA as the floor: 4.5:1 for normal text, 3:1 for large text and essential non-text UI boundaries. The palette
was selected so dark semantic text sits on very light semantic surfaces; implementations must still verify opacity-modified
utilities and dark-mode pairs. `scan` cyan is decorative on white and must not carry text. Use `scan-strong` for cyan-family
links or meaningful glyphs on light surfaces.

### 10.2 Interaction

- Interactive targets are at least 44×44px in shopping, upload, and mobile navigation flows. A control may look smaller
  (`sm` 32px, `md` 40px) only when its row or padding supplies a 44px hit area. The documented compact controls below `md`
  are the "View all" links and the empty-state button (32px); the "Start" pills (32px) and the quick-start chips (36px) are
  compact at every width (section 6.5). They remain deliberate product decisions.
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
block. Do not define a second competing colour system in `tailwind.config.ts`. See AGENTS.md's Styling rule for when
(rarely) a plain CSS class is the right call instead of a Tailwind utility.

Recommended mapping:

```css
:root {
  --background: #f2f4f7;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #e9ecf0;
  --secondary-foreground: #1d4ed8;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #dbeafe;
  --accent-foreground: #1e3a8a;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #cbd5e1;
  --ring: #2563eb;
  --scan: #38bdf8;
  --scan-strong: #0369a1;
  --collaboration: #7c3aed;
  --radius: 0.75rem;
}
```

`--destructive` is the solid danger button; failed-state text and icons use `#B91C1C` (red-700). Surface tertiary (`#DEE2E8`),
divider (`#EEF0F3`) and the hero scrim (`#080D1A`) are domain values without a shadcn name. The code stores these variables
as OKLCH. Keeping OKLCH is acceptable and preferred for controlled colour mixing; the hex
values above are the canonical visual targets, not a requirement to change syntax. The action-blue family is implemented
exactly, not approximated:

| Token (`--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring`) | Hex | OKLCH in `globals.css` |
| --- | --- | --- |
| Light | `#2563EB` | `oklch(0.5461 0.2152 262.8809)` |
| Dark | `#60A5FA` | `oklch(0.7137 0.1434 254.6240)` |
| Dark `--primary-foreground` and `--sidebar-primary-foreground` | `#0F172A` | `oklch(0.2077 0.0398 265.7549)` |

Before this, `--primary` held `oklch(0.6231 0.1880 259.8145)` (`#3B82F6`), a lighter blue than the spec.

### 11.2 Fonts

`src/app/layout.tsx` loads the three typography roles once and exposes them as CSS variables:

```ts
import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})
```

Apply all three variables to `<html>`. The global theme maps `font-sans` to Inter, `font-display` to Plus Jakarta Sans, and
`font-mono` to IBM Plex Mono. Individual components must not load their own web fonts.

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

These are remaining implementation notes, not permission for two systems:

1. **v2 surfaces and tokens:** `globals.css` still has `--background` white, `--muted` and `--sidebar` near `#F8FAFC`,
   `--secondary` near `#F1F5F9`, `--border`/`--input` as hairlines and `--radius` at 6px. Only the authenticated layout sets
   the `#F2F4F7` ground (`bg-[#F2F4F7]` on `main`), and only the dashboard uses 24px borderless cards and the `#E9ECF0` hover
   values (as literal arbitrary values in `dashboard-styles.ts`). Move them into tokens. Because `--radius` is 6px, `rounded-lg`
   and `rounded-xl` are 6px and 10px here, not the 8px and 12px of the v2 scale: the redesigned surfaces (sidebar, dashboard,
   tab bar) write those radii as explicit values (`rounded-[8px]`, `rounded-[12px]`) until the token changes.
2. **Buttons:** `ui/button.tsx` has `default`, `outline`, `secondary`, `ghost`, `destructive` and `link`, a 36px default
   height and a `rounded-md` default radius, applies `PRIMARY_BUTTON_LAYER` to every primary, and its `secondary` is the white outlined style.
   The v2 set (flat primary, secondary `#E9ECF0` with blue text, tertiary, outline ring, danger soft, sizes 32/40/48/52, 12px
   radius, highlight layer only on the hero and raised action) is not implemented.
3. **Canvas boards:** the A1 mobile boards still draw "View all" at 40px and the empty-state buttons at 44px, the new-account
   hero button at 52px, and an "Up Next" "View all" link; this document and the code use the compact phone sizes and no
   "Up Next" link. The "Invite family" row of "Up Next" is not produced by the dashboard model, and the quick-start chips
   exclude the list the hero button starts (the boards show all lists).
4. **Cards and dark mode:** cards outside the dashboard keep the 16px radius and a border; v2 dark values are not defined
   in the canvas, so dark mode keeps section 3.4 until it is reviewed.
5. **Colour discipline:** marketing, authentication, shopping categories, and statuses use independent violet, pink, green,
   amber, sky, and slate utilities. Consolidate them into the semantic palette above.
6. **Marketing motion:** `hero-mesh`, floating elements, pulsing arrows, and the looping scan line exceed the target motion
   rules. Keep one receipt-to-list transformation and remove ambient loops.
8. **Claims:** current marketing constants include “99% OCR accuracy” and “4.9/5 App store rating.” Remove them unless a
   maintained evidence source exists.
9. **Radius/elevation:** primitives and pages mix base 6px radii, 12px cards, 16px auth controls, and large device radii.
   Normalize to the roles in section 5.1 rather than by global search-and-replace.
10. **Icons:** Hugeicons and Lucide coexist. Standardize feature by feature, never by replacing icons without reviewing
   optical size and accessible labels.
11. **Dark mode:** semantic tokens exist, but one-off literal colour utilities and translucent surfaces require a complete
   contrast review.
12. **Copy:** product UI and documentation mix “ticket,” “receipt,” “shopping run,” and “shopping session.” User-facing
   English uses `receipt` and `shopping session`; internal legacy names may remain until safely migrated.

Migrate one vertical flow at a time: primitives and tokens, app shell, active shopping, receipts/OCR, lists and history,
authentication, then marketing. Each flow should be visually complete in light/dark and mobile/desktop before the next begins.

---

## 12. Do and don't

### Do

- Use paper-white surfaces on the grey canvas, grey surfaces nested inside white ones, and blue for user-driven actions.
- Reserve cyan for real scanning, OCR, transformation, and synchronization.
- Keep progress, remaining items, and the completion action visible during shopping.
- Use mono type only when content originates from receipt data or compact system metadata.
- Provide explicit loading, empty, failure, offline, and retry states.
- Test every core flow at 320px, with keyboard only, reduced motion, and dark mode.
- Use real, internally consistent product data in marketing previews.

### Don't

- Turn every card into a receipt or add torn-paper decoration to product UI.
- Use gradients, glows, floating badges, or perpetual motion as filler. The hero call to action and the raised tab-bar
  action are the only highlighted buttons.
- Outline cards, rows or menus with borders; separate them with surface and the shadows of section 5.3.
- Cycle arbitrary colours across shopping categories.
- Use cyan, faint grey, or colour alone for meaningful text or state.
- Hide primary mobile actions above the fold or behind an overflow menu.
- Publish performance, accuracy, rating, or adoption claims without maintained evidence.
- Introduce a new radius, shadow, status colour, or icon family without updating this document.
- Reach for a plain CSS file, CSS module, or inline `<style>` before trying Tailwind utilities (including arbitrary
  values and built-in variants) — a custom class is only for effects Tailwind genuinely cannot express (multi-layer
  gradients, `mask`, `repeating-linear-gradient`, `@keyframes`), never a shortcut around learning the utility, and
  never a parallel `--token` system duplicating colours Tailwind already has.
