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
  designSource: "Canvas artifact 'Listys - System Design' (https://claude.ai/artifact/XAzqD9iuotfD7udDqiVwhn): Design system v2 (boards Design-system-v2 1/2 and Design-system-v2-b 2/2) and the A1 / A1 mobile boards"

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
    fontSize: "clamp(44px, 7vw, 76px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  hero-lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.8vw, 20px)"
    fontWeight: 500
    lineHeight: 1.55
  marketing-heading:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 48px)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  h1-screen-title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "36px (24px on phones, 30px from md, 36px on desktop)"
    fontWeight: 700
    lineHeight: 1.11
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "30px (20px on phones: the hero and session titles)"
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
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
  tab:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
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
  dialog: "24px"
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
    height: "44px (xl, the library's own; primary below md is default 36px)"
    padding: "0 24px"
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
    padding: "12px (phones), 16px (md and up)"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "44px"
    padding: "0 14px"
  chip:
    backgroundColor: "status tint (100-level)"
    rounded: "{rounded.pill}"
    height: "22px"
    padding: "0 8px"
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
    padding: "12px (phones), 16px (md and up)"
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
    rounded: "{rounded.field}"
    minHeight: "48px"
---

# Listys Design System

## Overview

**Status:** Target canonical. This document owns Listys' visual language and interaction treatment. The current product is
partially aligned; section 11 records the migration work without redefining the target around accidental implementation
details. Its visual values follow the **Design system v2** canvas ("soft surfaces", artboards 1/2 and 2/2) and the A1 and
A1 mobile dashboard boards; where the product has not caught up, the gap is listed in section 11.4.

**Source canvas:** the "Listys - System Design" artifact (https://claude.ai/artifact/XAzqD9iuotfD7udDqiVwhn), boards
`Design-system-v2` (1/2: tokens, native shadcn scale, buttons, forms, cards) and `Design-system-v2-b` (2/2: feedback,
navigation, data, mobile A1). Every new component is built from these boards (rule in `AGENTS.md`, "Design System v2").
When a board and this document disagree, the board wins for the target look and this document is updated in the same
change.

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
| Display | `800 clamp(44px, 7vw, 76px)/1`, `-.035em` | Landing hero title only (`max-width: 18ch`, two lines on desktop). The tracking stays at `-.035em`: at `-.045em` the word spaces close up at this size |
| Hero lead | `500 clamp(18px, 1.8vw, 20px)/1.55` (Inter) | The line under the landing hero title; section ledes use Body large |
| Marketing heading | `750 clamp(32px, 4vw, 48px)/1.1`, `-.035em` | Landing sections |
| h1 (screen title) | `700 36px/1.11`, `-.03em` | Authenticated page heading; 24px (`text-2xl`, `/1.17`, `-.025em`) below `md`, 30px (`text-3xl`) from `md`, 36px (`lg:text-4xl`) on desktop |
| h2 | `700 30px/1.17`, `-.025em` | Hero and session titles: 20px (`text-xl`) below `md`, 30px (`text-3xl`) from `md`, never above the page h1 |
| h3 | `700 16px/1.25` below `md`, `700 18px/1.25` from `md`, `-.02em` | Session and list names, card titles |
| h4 (section title) | `600 20px/1.33`, `-.015em` | Section titles and "Up Next" from `md`; the dashboard sets them at `/1.39`, `-.01em`. On phones they are `h2` elements set at the h6 size (`600 16px/1.5`, `-.005em`) |
| h5 | `600 18px/1.39`, `-.01em` | Sub-sections |
| h6 (card title) | `600 16px/1.5`, `-.005em` | Groups, lists, receipts, history cards |
| Body large | `450 18px/1.65` | Marketing lead |
| Body | `400 16px/1.75` | Default app and marketing copy |
| Body small | `400 14px/1.5` | Secondary text, table cells, navigation and sidebar items |
| Body extra small | `400 12px/1.25` | Captions, helper text and fine print |
| Label | `600 14px/1` (Plus Jakarta Sans) | Buttons, tabs, form actions |
| Chip | `600 12px/1` (Inter, `text-xs`) | Status chips (`Badge`, 22px high) and counters (the date and session pills stay at `600 12.5px/1`) |
| Tab | `500-600 12px/1` (Inter, `text-xs`) | Tab-bar labels |
| Mono | `500 14px/1.5` | Ids, dates, amounts |
| Receipt meta | `500 12px/1.4`, `.01em` | Row metadata under titles: merchant, dates, item counts |
| Overline | `600 11px/1.2`, `.1em`, uppercase | Actual process stage or data category |
| Category caption | `600 12px/1.25` (Inter), `.04em`, uppercase, slate-700 | Category headings of a receipt, a list and a shopping session: the Caption size, not the mono Overline |

Use tabular numerals for prices, item counts, percentages, quantities, and timestamps. Headings use `text-wrap: balance`;
prose uses `text-wrap: pretty`. Uppercase is restricted to short mono overlines and the category caption. Item names use title
case in the product UI even when OCR input arrived in capitals; a category heading is the caption in capitals.

---

## 5. Shape, borders, and elevation

### 5.1 Radius

Medium (12px) is the radius of components, large (16px) of form fields, 24px of cards and dialogs; the full pill is
only for avatars, switches and progress bars.

| Token | Value | Applies to |
| --- | --- | --- |
| `checkbox` | `6px` | Checkbox |
| `tag` | `8px` | Chips, the date pill, small tiles in lists |
| `control` / `row` | `12px` | Buttons at every size, rows, menu items, icon tiles, avatars of groups and stores |
| `field` | `16px` | Inputs, selects, one-time-code cells, the raised tab-bar action |
| `panel` | `20px` | Action menus, the phone session pill |
| `card` | `24px` | Cards, hero surfaces, upload areas |
| `dialog` | `24px` | Dialogs and phone sheets (`rounded-3xl`) |
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
  Account and Sign Out live in that menu); it hides while scrolling down and returns while scrolling up. Navigation is a
  bottom tab bar (see 7.11). Keep the main action close to the bottom edge when the flow depends on it.
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

The category order follows product data; colour cycling between categories is not allowed (each category keeps one fixed colour on its icon, never the order). Category structure comes from
heading, spacing, and item counts. Checked items may move below unchecked items, but they must remain reachable and keep
their original content. On completed sessions, the screen becomes a record: destructive and editing controls disappear.

**Phone layout (design "Lists mobile · Sesión de compra").** Under the A1 header come the `Shopping` chip (22px, green, with the pulsing
dot), a progress card (24px radius; "Collected", "1 of 4 items" and the percentage in mono at 24px, blue and green at 100%, over an
8px bar), a row of two secondary buttons (`Share`, `Add Item`) and one card with a collapsible section per category (section 7.7).
The count at the right of each category is `done/total` in mono and turns green when the category is complete. The session's own
actions are one small floating `Actions` button (40px, white, blue label, a cart icon and a chevron) at the bottom right above the tab
bar, away from the raised upload button. It opens a menu with `Complete Shopping` and, apart, `Cancel Shopping` in red. From `lg` the
button is replaced by two buttons beside the title (`Cancel Shopping` soft red, `Complete Shopping` primary) and the content is capped at
768px. The session bar of section 6.5 is not shown here: this screen is where it leads.

`Complete Shopping` opens a sheet (section 7.12): with items still unticked it says how many ("You still have 3 unchecked items…"); with
all of them ticked its title is "All Items Checked" and a green stroke icon replaces any celebratory emoji. Both offer "Sync changes
back to base list", ticked by default, and the buttons `Continue Shopping` and `Complete Session`. `Cancel Shopping` opens a sheet that
says the session is discarded, is not saved to the history and cannot be undone, with `Keep Shopping` and a red `Cancel Shopping`.
Only the owner of the list sees these actions. A finished session shows `Completed`, a `Purchased` progress card and only the items
that were bought, without checkboxes or menus.

### 6.4 Cards and collections

- One column below `sm`, two columns from `sm`, and three only when a card remains at least 280px wide.
- A card has one dominant destination. Secondary edit/delete actions live in a menu or explicit action cluster and must not
  create nested interactive elements.
- Count, status, and last activity form the metadata line. Avoid oversized decorative icons that displace useful content.
- Empty states occupy the collection region, not the entire viewport. They explain why it is empty and provide exactly one
  primary next step.

### 6.5 Dashboard and phone shell (design A1)

The dashboard and the phone shell follow the A1 and A1 mobile boards of the canvas. Their values take precedence over the
generic scale on this surface. They are expressed with the native props and tokens of `src/components/ui/` (section 11.5) and
the shell in `src/components/app/mobile-tab-bar.tsx`.

**Phone shell** (below `lg`):

| Piece | Spec |
| --- | --- |
| Header | 60px (64px from `lg`), white with a bottom hairline; logo 30px plus the "Listys" wordmark (Plus Jakarta Sans 700 19px, `-.02em`); a 44x44 account button with a 34px initials avatar on `#DBEAFE`. No menu button: Profile, Account and Sign Out live in the account menu |
| Tab bar | See section 7.11 |
| Session bar | Only while a trip runs, on every phone screen except the trip's own (`ActiveSessionBar`): 48px high, 16px radius, `#0F172A`; a 28px progress ring with a green dot, the trip name (12px / 700) and "n of m · p%" (mono 12px), and a `Button size='sm'` "Continue" (32px, 14px / 600, 8px radius). The whole bar is the link. It floats 8px above the tab bar with 12px side insets, stays visible next to the dashboard hero's own button, and the raised tab-bar action overlaps its lower edge |
| Content | 16px gutter, 20px above the greeting, 40px below the last card, plus 56px while the session bar is shown (a spacer after the page); surfaces pinned to the bottom edge sit above the tab bar (`ABOVE_MOBILE_TAB_BAR`), and above the session bar when it shows (`ABOVE_MOBILE_SESSION_BAR`) |

**Hero.** A 24px-radius photo surface under the `hero-scrim`. One blue 52px button does the obvious thing: "Continue
shopping" for a running session, "Start shopping" for the most overdue list, or "Upload receipt" for an account without
lists (44px on phones, 52px from `md`). A running trip shows the "Shopping now" chip, the group and list, a progress bar
(8px, white 16% track, `#60A5FA` to `#3B82F6` fill) with `n of m items - p%` in mono, and the collaborators (24px initials
on pastel blue, pink and green, overlapping by 7px, with a 2px near-black ring). Without a session the hero omits a status
chip, then shows the quick-start list shortcuts (36px high at every width) and the last trip in mono. A new account sees only
the title "Start with a receipt", its explanation, the button and a mono note.

**Sections** (Shopping List Groups, Receipts, Shopping History):

| Piece | Spec |
| --- | --- |
| Title row | `h2` 20px / 600 / 1.39 / `-.01em` and, on the right, a "View All" ghost link (blue 700, 600, 12px radius, hover `#E9ECF0`) 12px above the card. 32px high with a 12px label on phones; 40px and 14px from `md` |
| Card | White, 24px radius, 12px padding on phones and 16px from `md`, `raised` shadow, no border; the shadow deepens on hover |
| Row | 12px radius, `10 8` padding, 12px gap, 36px icon tile (12px radius) in the 100-level tint (the same fill "Up Next" uses), 14px / 600 title, mono 12px / 500 metadata in `muted` (may wrap), hover `#F2F4F7` |
| Tile tints | Groups `#DBEAFE` / `#1D4ED8`, receipts `#CFFAFE` / `#0E7490`, history `#DCFCE7` / `#15803D` (the 100-level fill with the 700-level icon, as in "Up Next" and the tab bar); 24px tile (8px radius) for lists, 32px (10px radius) for groups |
| Group and lists | A group row plus its lists, indented 24px with a 2px `#E2E8F0` rule; each list ends in a grey "Start" button (32px, `#E9ECF0`, 12px radius, 13px / 600). Preview: two groups of up to three lists |
| Receipt status | A 14px icon plus the word, Plus Jakarta Sans 700 12px, no chip: Completed `#15803D`, Processing `#B45309`, Failed `#B91C1C`; `divider` rules between rows (inset 8px). Preview: three receipts |
| History | Mono 13.5px / 600 total on the right. Preview: three trips |
| Empty | Minimum 172px, a 56px tile (16px radius) in the 100-level tint (blue `#DBEAFE` / `#1D4ED8`, cyan `#CFFAFE` / `#0E7490`, green `#DCFCE7` / `#15803D`), a two-line 13.5px explanation in `muted` (max 280px) and one primary button ("New group", "Upload Receipt"; History has none). The button is 32px with a 12px label on phones and 44px with 14px from `md` |

**Up Next.** One white card (24px radius, 12px padding on phones and 16px from `md`) of up to three rows: 64px high, 14px radius, a 40px tile (12px
radius, 100-level tint with 700 icon: amber for a receipt waiting, red for one that failed, blue for a list not shopped for
a while), a 14px / 600 title, a 12.5px `muted` detail, an 18px chevron in `faint`, and `divider` rules inset 64px left and
12px right. The whole row is the link; the title has no "View All". Hover is `#F2F4F7` without lifting. The stacked variant
with a tertiary action button is not used on the dashboard.

**Greeting.** A white 28px date pill (8px radius, a hairline ring, 12.5px / 600, a sun icon) in the visitor's own locale,
the h1 with the name, and one line of context in `muted`.

**Failure.** If any of the dashboard's data fails to load, the page shows an error with "Try again" instead of the dashboard:
a failed request must not look like an empty account. The photo behind the heroes is a `next/image` (`HeroSurface`).

**Sizes that change with the viewport:**

| Element | Phones | From `md` / `lg` |
| --- | --- | --- |
| Page title | 24px (`text-2xl`) | 30px (`text-3xl`) from `md`, 36px (`lg:text-4xl`) on desktop |
| Hero and session title | 20px (`text-xl`) | 30px (`text-3xl`) from `md` |
| Primary action (`size='primary'`) | 36px, 14px (`default`) | 40px, 14px from `md` (`lg`) |
| Hero button | 52px; hero card action 40px (`lg`) | 52px; hero card action 44px (`xl`) |
| Quick-start chips | 36px / 12.5px | 36px / 12.5px |
| Empty-state button | `primary`, 36px / 14px | `primary`, 40px / 14px |
| "View All" | 32px / 12px | 40px / 14px |
| Header | 60px | 64px (`lg`) |
| Tab bar and session pill | Shown | Hidden (`lg`) |
| Header "Upload Receipt" | Hidden | Shown (`lg`) |

---

## 7. Components

### 7.1 Buttons

All buttons have a 12px radius at every size. Use one primary action per region; secondary for supporting actions with a
blue tint; tertiary (neutral) for repeated actions; danger only in confirmations.

The text of every button and link is in Title Case ("Start Shopping", "View All", "Sign Out", "Create Account with Email"):
each word capitalised except short articles, conjunctions and prepositions ("a", "and", "with", "to"), which stay lowercase
unless they open the label. This covers visible text and the tooltip titles of icon buttons ("Copy Link"). Headings,
descriptions, badges, toasts and list or receipt data keep sentence case.

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
| `default` | 36px below `md`, 40px from `md` | 0 12px, then 0 16px from `md`; 14px / 600, 6px gap (the default size) |
| `lg` | 40px | 0 16px, 14px / 600 |
| `xl` | 44px | 0 24px, 16px / 600 (the library's own xl; toolbars and sheet footers from `md`) |
| `primary` | 36px below `md`, 40px from `md` | The primary action of a screen, sheet or form: `default` on phones, `lg` from `md` (see section 11.5) |
| `hero-action` | 40px below `md`, 44px from `md` | The dashboard hero card action: `lg` on phones, `xl` from `md` |
| `2xl` (hero) | 52px | 0 28px, Plus Jakarta Sans 700 16px, 10px gap, 18px icon |
| Icon only | 36 to 48px | 18px icon; the raised tab-bar action is 48x48 with a 16px radius |

Touch: standard buttons use `default` (36px) below `md` and `lg` (40px) from `md`; `primary` follows the same responsive sizing for main actions. Use `sm` only inside dense rows that provide a 44px hit area.
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
surfaces such as the dashboard banner: a 26px pill with a 12% white fill and a 7px dot. Status chips are small
22px pills (999 radius) tinted with the 100-level of their status (`Pending` slate-100 / slate-700, `Processing` amber-100 / amber-700,
`Completed` green-100 / green-700, `Failed` red-100 / red-700), with a 12px icon (a 6px dot for `Pending`) and a 12px / 600 label, padding
8px. They are deliberately not the shape of a button (12px radius, `#E9ECF0`, 40px), so they never read as pressable. Counters share the
22px pill with a 12px label, and deltas and "New" use the same tinted success and danger surfaces.

Badges are compact context, never the only explanation for a failure. A failed receipt also includes a short safe error and
`Try again` when retry is available.

### 7.4 Receipt upload and processing

The upload form (`features/tickets/upload/`) opens as a bottom sheet on phones (24px top radius, up to 92% of
the viewport) and as a centred 520px dialog from `sm`. It has a Jakarta 600 20px title with a 44px close button, a grey 14px
description, a `Name *` field (48px, 16px radius) and `Photos *` with a mono `n / 5` counter. The photo field starts as one
dashed 16px-radius tile with an upload glyph, `Choose Photos` in blue and the accepted formats and the 10MB per-image limit;
once there are photos it becomes a 3-column grid of 3:4 thumbnails, each with a 44px target to remove it (a 24px dark disc),
and an `Add More` tile while there is room. A photo that is left out (HEIC, or over 10MB) is named in an inline red alert with
how to fix it; it does not block the others. `Upload` is enabled as soon as there is one valid photo (up to five); a missing name is reported on submit, not by a dead button.
From `sm` the empty tile reads `Drag and drop photos here` / `or Choose Photos`, and the footer is one row: `* Required fields` on the left, `Cancel` and
`Upload` (44px) on the right. Removal does not shift keyboard focus unpredictably.

After submit:

1. `Uploading photos` — determinate only if real byte progress is available.
2. `Waiting to be read` — static pending state.
3. `Reading receipt` — the signature scan seam may animate inside the preview.
4. `Review items` — resolved structured rows; animation stops.
5. `Couldn’t read receipt` — failure summary plus retry or replace-photo action.

Never invent a percentage for asynchronous OCR. A spinner or staged label is more honest.

### 7.5 Receipt card

The list card (`features/tickets/list/tickets-list.tsx`) is a 24px borderless card: a 36px cyan tile (12px radius, the size of the dashboard's receipt rows) with an 18px receipt glyph, the
merchant name (Jakarta 600 16) beside the status chip, and the upload date and time in mono 12/500 underneath. A hairline
separates one line about where the receipt stands: `Waiting in line to be read` (pending), a progress bar and `Reading your
receipt...` (processing, no invented percentage), `Couldn’t read this receipt` in red with `View Details` (failed), or the item
count in mono with `View Details` (completed). Merchant name is the title even when OCR returns none; use “Store not
recognized,” not “Unknown.” Completed and failed receipts show a `View Details` link in the footer; only that link opens the
detail page. Pending and processing cards have no detail link, and the card body is not interactive.

From `md` the grid is two columns (three from `xl`) and ends with a dashed `Upload Another Receipt` tile that opens the upload form; photos dropped on it
arrive already chosen (`UploadAnotherTile`). The empty state is one 24px card with a 64px (72px from `md`) cyan tile, `No receipts yet`, the one primary `Upload Receipt` button (48px) and the
limits in mono (`1–5 photos · PNG or JPG · 10 MB each`). Phones have a single upload action: the tab bar's raised button; the page
has no second pinned upload bar. The page header uses the `screen` variant of `PageHeader`: back link (44px target) above a 30px
title on the page ground, with no white band.

### 7.6 OCR review row

Each extracted row exposes item name first, then quantity/unit and price. Confidence is not shown in the MVP unless it drives
a user decision. Selected rows use a checkbox, `aria-checked`, a soft blue surface, and a visible check. Price uses tabular
numerals and the locale-aware currency formatter. Edits retain the source image association without exposing internal IDs.

On the receipt screen (`features/tickets/receipt/ticket-review.tsx`) the photo is never buried below the list: a 100px row under the
title (thumbnail, `Receipt Photo`, `1 photo · Tap to enlarge`, a 44px expand control) opens a full-screen viewer with pinch and
double-tap zoom, `−`/`+`, Rotate and Fit, a strip of 48px thumbnails when there are several photos, and `Compare`. Compare puts
the photo above the items with a draggable, keyboard-operable separator, so a line can be checked against the paper and ticked
without scrolling. Items are grouped by category in collapsible sections (a 32px grey tile with the category's own coloured line icon, the name as the category caption in capitals, a mono count); OCR
names printed in capitals are shown in Title Case (short codes such as “PC” stay, the stored value is untouched). Rows have a
44px checkbox target, a quantity chip and the price in mono. Ticking items raises a bar above the tab bar's upload button with the
count, their total in mono, `Clear` and `Add to a List`. The summary card closes the screen with the item count, the calculated
total (mono 20/700) and the receipt's own actions: `Retry` when it can be retried and a soft-red `Delete Receipt`.

From `lg` the screen is two columns (3fr / 2fr). The items card is on the left, with its rows on one line (checkbox, name, quantity chip, price)
and the selection bar stuck to the bottom of the card. The right column stays in view while the list scrolls: a `Receipt Photo` card (the photo on
a dark stage, zoom, rotate and fit over it, a strip of 48px thumbnails and a `1 / 3` counter for several photos, and `Open Full Screen`), then the
summary card. The full-screen viewer gets a left column of thumbnails, 52px arrows, a hint (`Scroll to zoom · Drag to pan · ← → to switch photos`),
the wheel and mouse drag, and the keys `← →`, `+`, `-` and `0`. Compare puts the photo on the left (60% of the width) and the items on the right,
with a vertical, keyboard-operable separator and the selection bar at the foot of the list. Zoom is relative to the photo's fitted size, so every step
is the same enlargement whatever the shape of the photo or the screen.

A receipt that was read but has no items (completed, 0 items found) keeps its items card but swaps the list for a warning: a 64px amber tile,
`No items detected` (Jakarta 700 18), the explanation and three tips for a clearer photo. Its action card offers `Upload a Clearer Photo` (primary),
`Try Again` (secondary, reads the same photo again) and the soft-red `Delete Receipt`; there are no totals.

### 7.7 Group and base-list card

The Lists section (design boards "Lists mobile") has four screens built from one set of pieces in `components/commons`
(`EntityCard`, `EntityEditCard`, `CreateEntitySheet`, `ConfirmSheet`, `ListToolbar`, `EmptyStateCard`, `CategorySection`, `RowMenu`).

- **Groups and lists.** After the A1 header, a toolbar row: the mono count ("3 groups") at the left and the screen's one creation
  action at the right (`New Group`, `New Base List`: 44px, 12px radius, primary). A card (24px radius, borderless, 12px padding on phones and 16px from `md`) holds a
  36px blue tile (the 100-level fill, 700-level icon), the name (Plus Jakarta 16px / 600), one line of description or notes with an
  ellipsis, and a `...` menu of 44px with Edit and Delete (Delete in red). Below a hairline, the count in mono ("2 lists", "No lists
  yet") and a blue `View Details` / `View Items` link. Only the footer link opens the group or list; the title and card body are not interactive, and the menu remains independent.
  One column below `sm`, two from `sm`, three from `xl`.
- **Edit in place.** `Edit Group` / `Edit List` swaps the card for a form on the same surface: `Name *` (a 48px field) and
  `Description` / `Notes` (a field that grows), then `Cancel` and `Save` side by side. An empty name shows "Name is required" under the
  field with an alert icon and a red 2px ring.
- **Create.** A bottom sheet on phones and a 520px dialog from `sm`: title, one line of help, the same fields, "* Required fields" and
  `Cancel` / `Create Group` (`Create List`). The first-use state is one card with a blue tile, what is missing and the same action.
- **Delete.** A sheet titled with the name ("Delete “Walmart”?") and a red box with the consequence (the lists and items that go with
  it, the people who lose access, that it cannot be undone), then `Cancel` and a red `Delete Group` / `Delete List`.
- **Loading.** `loading.tsx` draws the toolbar and three card shapes.
- **Category section.** A list's items and a trip's items sit in one card; each category folds: a 32px grey tile with the category's
  own coloured icon (700 level: Bakery amber, Bulk Food orange, Dairy sky, Frozen teal, Meat red, Pantry purple, Produce green, Home
  indigo), its name as the category caption (section 4.2), the count in mono (`3 items`, or `1/2` in a trip) and a chevron; the rows
  sit on a `#F6F7F9` surface with 16px radius. Lists longer than 12 items open only their first two categories.

### 7.8 Shopping item row

A list item row is at least 64px high: a quantity chip (22px, 7px radius, mono quantity and unit), the name in Title Case (the stored
name is never changed) with an optional 12px note, and a 44px `...` menu with `Edit Item` and `Delete Item`. Editing swaps the row for an
`Edit Item` form in its category (name, quantity and unit, notes, `Cancel` / `Save`). Deleting offers `Undo` in a toast; the API has no
restore, so Undo adds the item again with the same data. A shopping-session row (68px) starts with a 44px checkbox target: tapping the
label toggles the item, a ticked item is struck through and grey with its chip faded (never opacity alone: the checkbox and the
accessible name say it too), and its menu is the same. `Add Item` is a sheet with name, quantity, unit, category and notes; its errors
read "Name is required" and "Must be above 0" under the field. Realtime updates must not animate or reorder while the user is editing
that row.

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
raised 48px **Upload Receipt** button (`fab`, `icon-2xl`, 16px radius) in the middle, Receipts and History.

| Piece | Spec |
| --- | --- |
| Bar | White, a hairline on top and a soft upward shadow; padding `4 8 18` (the bottom grows to the device's safe-area inset when larger); pinned to the bottom edge of the screen; hidden from `lg` |
| Content clearance | The scrolling content carries a bottom padding equal to the bar's height (80.5px) so its last row stays reachable; surfaces pinned to the bottom edge sit above it (`ABOVE_MOBILE_TAB_BAR` in `src/components/app/helpers/mobile-tab-bar-layout.ts`) |
| Tab | Height follows its content (44px minimum hit area, `min-h-11`), so every tab is the same height and the bar never changes height; 24px icon at stroke 1.5, 12px label (`text-xs`), 12px radius |
| Current tab | `#E9ECF0` surface, `#1D4ED8` text and weight 600, with no extra marker (`aria-current="page"`); inactive tabs are `slate-500`, weight 500. Lists stays current on a list and on a shopping session, whose paths start with `/base-lists` and `/shopping/` |
| Raised action | 58x58, 16px radius, primary with the highlight layer, a 6px white ring plus the blue glow, 24px above the bar edge, 26px icon, `aria-label` "Upload a receipt" |

The desktop sidebar follows the A1 desktop board (the shadcn floating sidebar): a white card with a 12px radius and a
hairline ring, 240px wide inside 8px margins on the page ground. It opens with the brand (the Listys mark at 32px, "Listys" in
Jakarta 600 14 and "Reuse lists. Shop together." in 12px muted, a 64px block that links home), then the three groups (Shopping,
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

**A1 sheets.** Every create, edit, share and confirm flow of the Lists and receipts screens opens in `SheetDialog`: a bottom sheet on
phones (24px top radius, a 20px Plus Jakarta 600 title at the left, a 44px close target) and a centred 520px dialog from `sm`.
`ConfirmSheet` is its two-button form: `Cancel` (grey) at the left and the confirm at the right, 48px tall, red for a destructive action,
with an optional red consequence box. Start Shopping is one: a 48px blue cart tile, "This will create a new shopping session using the
items of “…”" and the note "Only one shopping session can be active at a time". While a session is active the `Start Shopping` button
is not drawn at all, on the list screen and on the dashboard, and the session bar (section 6.5) is the way back. A list with no items
shows it disabled.

The share sheet holds the list's `Invite link` (a read-only mono field with an ellipsis, `Copy Link` that turns into `Link Copied`, and
`Regenerate` / `Revoke`, which asks first in the same place) and its `Collaborators` (initials avatar, name, a role chip, and a remove
control that asks first in the row).

Dialogs are white with a 24px radius and the `overlay` shadow: a 22px icon, a Plus Jakarta Sans 700 17px title, a 28px
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
  (`sm` 32px, `default` 36px) only when its row or padding supplies a 44px hit area. The documented compact controls below `md`
  are the "View All" links (32px) and the "Start" pills (32px); the primary action of a screen is `primary` (36px below `md`, 44px from `md`), and the empty-state button is `primary` too; the "Start" pills (32px) and the quick-start chips (36px) are
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

1. **v2 surfaces and tokens (done, see 11.5):** `--background` is the `#F2F4F7` ground, `--secondary` the `#E9ECF0` button surface,
   `--muted` `#F6F7F9`, `--destructive` `#DC2626` and `--radius` 8px, so `rounded-xl` is the 12px of controls and no call site writes an
   arbitrary radius or hex. The marketing root restores the pre-A1 values for the landing page. Still open: `--border`/`--input` as
   hairlines and the sidebar tokens.
2. **Buttons (done, see 11.5):** `ui/button.tsx` carries the sizes (24, 32, 36, 40, 44 and 52px), the 12px radius, the Plus Jakarta
   label and the `secondary`, `destructive`, `destructive-soft`, `success-soft`, `hero` and `fab` variants. Still open: the tertiary
   variant, and the highlight layer is still on every primary instead of only the hero and the raised action.
3. **Canvas boards:** the boards and the design system still draw the labels of buttons and links in sentence case ("View all",
   "Start shopping", "Sign out", "New group"); the code follows the Title Case rule of section 7.1. They also still draw "View all" at 40px and the empty-state buttons at 44px, the new-account
   hero button at 52px, and an "Up Next" "View all" link; this document and the code use the compact phone sizes and no
   "Up Next" link. The "Invite family" row of "Up Next" is not produced by the dashboard model, and the quick-start chips
   exclude the list the hero button starts (the boards show all lists).
3a. **Lists:** the Lists screens implement the phone designs (groups, lists, items, share, start, session, session bar) and degrade on desktop to the
   same toolbar and cards, with the items and the session capped at 768px. Gaps: `Undo` after deleting an item adds it again (new id) because the API has no restore;
   units show as stored (`l`, `unit`) where the boards draw `L`; "Revoke" keeps the existing behaviour (people who joined keep access until removed) and says so;
   the toast of `Undo` appears at the top (`Toaster` position) and not above the tab bar; and the session bar needs a second request for its count when the page changes.
3b. **Receipts:** the receipt screens implement the phone and desktop designs. Gaps: the upload form shows an indeterminate progress line, not the
   per-photo progress ("1 of 2 photos uploaded") of the mockups, because the photos go up in one request; and the receipt list has no filter or search.
3c. **Authentication:** sign in and sign up implement the "Auth" boards of the canvas (B desktop, C mobile; `features/auth/`): a white panel with the form beside a photo panel from `lg`, and the photo header with the form on a white sheet below it. Each mode uses its own 1280px banner (`public/images/auth/signin-banner.webp` or `signup-banner.webp`). The mode switch is a segmented `Button variant='segment' size='touch'` pair of links; fields are the white `Input size='lg'` of the other forms. Gaps: "Forgot Password?" links to `/auth/reset-password`, which does not exist yet; labels keep the app's 20px line height where the boards draw 17px (the form is 3px taller per label); desktop fields are 14px where the boards draw 15px; the submit button keeps the highlight layer of every primary (gap 2); "Back to Home" is slate, the boards draw it in ink.
4. **Dark mode:** `Card` is the 24px borderless surface everywhere now; v2 dark values are not defined in the canvas and the new
   tokens (`--secondary-hover`, shadows) only keep dark mode valid, so it is deferred until it is reviewed.
5. **Colour discipline:** marketing, authentication, shopping categories, and statuses use independent violet, pink, green,
   amber, sky, and slate utilities. Consolidate them into the semantic palette above.
6. **Marketing motion:** `hero-mesh`, floating elements, pulsing arrows, and the looping scan line exceed the target motion
   rules. Keep one receipt-to-list transformation and remove ambient loops.
8. **Claims:** current marketing constants include “99% OCR accuracy” and “4.9/5 App store rating.” Remove them unless a
   maintained evidence source exists.
9. **Radius/elevation:** the roles of section 5.1 map onto the native radius scale (11.5); marketing keeps its own 6px base.
10. **Icons:** Hugeicons and Lucide coexist. Standardize feature by feature, never by replacing icons without reviewing
   optical size and accessible labels.
11. **Dark mode:** semantic tokens exist, but one-off literal colour utilities and translucent surfaces require a complete
   contrast review.
12. **Type scale outside the landing page and dashboard:** these two follow section 4.2; the rest of the app does not yet.
    `PageHeader` now sets the screen h1 at 24px below `md` and 30px from `md` (done); empty-state
    `h3`s use three different styles (`text-xl`/`text-lg`, `font-semibold`/`font-medium`) instead of the 24px h3; `CardTitle`
    and `SheetTitle` are `font-medium` where the card title is 600, and `DialogTitle` is the 18px h5; the sidebar, the account
    menu and several dialogs use 10px, 13px, 13.5px and 15px values outside the scale; IBM Plex Mono still loads weight 400.
    Mock-up internals on the landing page (the receipt paper, the phone screen, the list rows) keep their own small illustrative
    sizes and are not part of the scale.
13. **Copy:** product UI and documentation mix “ticket,” “receipt,” “shopping run,” and “shopping session.” User-facing
   English uses `receipt` and `shopping session`; internal legacy names may remain until safely migrated.

Migrate one vertical flow at a time: primitives and tokens, app shell, active shopping, receipts/OCR, lists and history,
authentication, then marketing. Each flow should be visually complete in light/dark and mobile/desktop before the next begins.

### 11.5 Native scale: the design on the library's own props

The design is implemented with shadcn's native props and Tailwind's own scale; a call site does not restate any of it in `className`
(AGENTS.md, "shadcn-native first"). Where the mockups draw a value that is not on the scale, the closest native one is used.

| Concern | Native value | Lives in |
| --- | --- | --- |
| Button `size` | `xs` 24 · `sm` 32 · `default` 36 · `lg` 40 · `xl` 44, the library's own xl: `px-6`, `text-base`, `gap-2` (touch actions, toolbars, sheet and form footers; the mockups' 48 became 44) · `2xl` 52 (hero) · `avatar` 44 circle that widens into a pill from `lg` (the account trigger) | `ui/button.tsx` |
| Button `weight` | `default` semibold · `medium` (the landing header's lighter label) | `ui/button.tsx` |
| Icon button `size` | `icon` 36 · `icon-xs` 24 · `icon-sm` 32 · `icon-lg` 40 · `icon-xl` 44 · `icon-2xl` 48 (raised tab-bar action) | `ui/button.tsx` |
| Button `variant` | `default`, `secondary` (`--secondary`, blue text), `outline`, `ghost`, `destructive`, `destructive-soft`, `success-soft`, `hero` (glow, lift), `fab`, `link`; quiet row/icon actions `quiet`, `quiet-destructive`, `destructive-ghost`, `ghost-primary` (a blue text action such as "View All"), `floating` (the session Actions button); the dark viewer's `on-dark`, `viewer`, `overlay`; the drop target `dropzone` | `ui/button.tsx` |
| Button `size` on phones | Standard buttons use the library's `default` (36px, `px-3`, `gap-1.5`) below `md` and `lg` (40px, `px-4`, `gap-1.5`) from `md` up. `primary` uses the same scale for the main action of a screen, sheet or form. The dashboard hero card action uses `hero-action`: `lg` (40px) on phones and `xl` (44px) from `md`. `sm`, icon, hero and content-driven sizes keep their own scale. One size, two breakpoints, no hook | `ui/button.tsx` |
| Title roles on phones | Below `md` the page heading (`h1`, the screen header and the dashboard greeting) is `text-2xl` (24px); from `md` it is `text-3xl` and `lg:text-4xl` as before. The hero and session title (the dashboard hero, the no-session banner) is `text-xl` (20px) below `md` and `text-3xl` from `md`. Card names stay `text-base`, metadata `text-xs`. Receipt and group cards use `p-3 gap-2` below `md` and `p-4 gap-3` from `md`; they are plain elements, not `Card`, so their padding is a responsive class on the element | `app/`, `components/` |
| Button `size` (content height) | `block`: `h-auto`, several lines, 24px padding (drop targets) | `ui/button.tsx` |
| Button `rounded` | `xl` by default (12px); `md`, `lg`, `2xl`, `3xl`, `full` | `ui/button.tsx` |
| Link that looks like a button | `<Button asChild variant size><Link/></Button>`; never `buttonVariants()` or hand-set classes on `Link` (back link, "View All", the shortcut chips, the session bar's Continue) | call sites |
| Field `size` | `default` 36 (`rounded-xl`) · `lg` 44 (`rounded-2xl`, the 16px of the form fields); borderless on `bg-card` with `shadow-field`; invalid: a `--destructive` ring | `ui/input.tsx`, `ui/textarea.tsx`, `ui/select.tsx` |
| Card | `rounded-3xl` (24px), `shadow-card`, no border; 12px padding on phones and 16px from `md`; `size` `compact` / `tight` / `flush` keeps that inset for compact row cards; `variant` `premium`, `accent`, `ghost`, `glass`; `interactive` lifts the shadow | `ui/card.tsx` |
| Card parts | `CardHeader spacing` `default` · `tight` (8px under it, standalone cards); card sides use 12px below `md` and 16px from `md`; `CardContent space` `default` · `snug` (12px gap in a flex column) · `stack` (16px between stacked blocks) and `inset` `default` · `top` (24px above a content with no header) · `compact` (responsive card-side inset) | `ui/card.tsx` |
| Badge | 22px (`h-5.5`), `text-xs`; `variant` `completed`, `failed`, `processing`, `pending`, `neutral`, `outline`, `on-dark`; `size` `lg` | `ui/badge.tsx` |
| Dialog, sheet | `rounded-3xl`; on phones the sheet is `rounded-t-3xl`. `DialogContent variant` `sheet` (the A1 form panel: 20px gap, 20/24px padding, no border, safe-area bottom) or `viewer` (dark full screen); `DialogTitle variant` `sheet` / `strong` / `viewer`; `DialogDescription variant` `sheet`; `AlertDialogTitle variant` `strong`; `AlertDialogMedia tone` `destructive`. `DialogHeader variant='sheet'` (left-aligned, 4px gap, room for the close button) and `DialogFooter variant` `inline` (one row, 12px gap) or `sheet` (two actions stacked with the primary on top below `sm`, two equal columns from `sm`: the confirm of every sheet, because two xl buttons with 24px padding do not fit side by side at 390px). Closing is `<DialogClose asChild><Button variant='quiet' size='icon-xl'>` | `ui/dialog.tsx`, `ui/alert-dialog.tsx` |
| Menus | `DropdownMenuContent variant` `menu` (a row or action menu: 16px radius, `shadow-menu`) or `account` (24px radius, `shadow-menu-lg`); `DropdownMenuItem size` `touch` (44px, display face) · `row` (52px link row) · `action` (filled secondary row, e.g. Sign Out) and `variant='destructive'`; `DropdownMenuLabel variant='identity'`; `DropdownMenuSeparator variant='solid'` | `ui/dropdown-menu.tsx` |
| Form parts | `Label` is 14px semibold with the default 20px line; `Checkbox size` `default` 16 · `lg` 22 (the touch box of lists); `CardTitle variant` `strong` / `display`; `CardDescription size` `lg`, `weight` `medium` | `ui/label.tsx`, `ui/checkbox.tsx`, `ui/card.tsx` |
| Progress | `size` `default` 12 · `md` 8 · `sm` 6; `tone` `default`, `soft` (pale blue track), `track` (hairline-grey), `on-dark` (translucent track, blue gradient fill); `complete` turns the fill green | `ui/progress.tsx` |
| Avatar | `size` `sm` 24 · `default` 32 · `md` 36 · `lg` 40 · `xl` 44 · `2xl` 96; `ring` for the profile portrait; `AvatarFallback tone` `soft` (blue initials badge) or `initials` (bold uppercase); `AvatarGroupCount` is 12px bold | `ui/avatar.tsx` |
| Sidebar | the A1 entries are the default look of `SidebarMenuButton`, `SidebarMenuSubButton` and `SidebarGroupLabel` (slate entry, blue on the secondary surface when current); the A1 spacing is the default of the parts: `SidebarContent` and `SidebarFooter` `gap-3 p-2`, `SidebarGroup` `gap-0.5 p-0`, `SidebarMenu` `gap-px px-1.5`; `SidebarProvider` carries the page ground; `--sidebar` is the card white in light mode | `ui/sidebar.tsx`, `globals.css` |
| Collapsible | `Collapsible variant='section'` leaves 10px under its open content; `CollapsibleTrigger variant='row'`: the 52px header row of a category section | `ui/collapsible.tsx` |
| Badge `size` | `lg` 28 (rounded-lg) · `hero` (as tall as its two lines need, for the pill over the dashboard hero) | `ui/badge.tsx` |
| Radius scale | `--radius` 0.5rem: `rounded-lg` 8 · `rounded-xl` 12 (controls, rows) · `rounded-2xl` 16 (fields) · `rounded-3xl` 24 (cards, dialogs) · `rounded-full` | `globals.css` |
| Colour tokens | `--background` `#F2F4F7` · `--card` white · `--secondary` `#E9ECF0`, `--secondary-hover` `#DEE2E8`, `--secondary-foreground` `#1D4ED8` · `--muted` `#F6F7F9` · `--destructive` `#DC2626` · `--color-ink` `#0B1220` (receipt viewer) | `globals.css` |
| Shadow tokens | `shadow-card`, `shadow-card-hover`, `shadow-field`, `shadow-premium`, `shadow-glow`, `shadow-fab`, `shadow-menu`, `shadow-menu-lg` | `globals.css` |
| Spacing, sizes | Tailwind steps (`h-5.5`, `gap-2.5`, `p-4`); odd pixel values were rounded to the nearest 2px step | call sites |
| Text | `text-xs` 12 · `text-sm` 14 · `text-base` 16 · `text-xl` · `text-3xl` 30 · `text-4xl` 36; `tracking-tight` for titles, `tracking-widest` for overlines | call sites |
| Global styles | app-wide tokens, base rules and the `focus-ring` utility: `src/app/globals.css`; the landing page's own styles and the `.marketing` scope that restores the pre-A1 white page, light secondary and 6px radius: `src/app/(marketing)/marketing.css` | `src/app/` |

What stays as a class by rule, and is checked by `src/test/native-props-guard.test.ts`: layout (width, margin, position, flex/grid
placement), the shape of a `Skeleton` (its size and radius are the placeholder), and the glyph size of an icon. The padding and the gap
of a container (`CardContent`, `CardHeader`, `DialogHeader`, `DialogFooter`, `Sidebar*`, `RadioGroup`, `Collapsible`) are theme, not layout:
they come from the variants above, and the guard flags `space-y-4`, `gap-3` or `pt-6` on them. The few justified exceptions are listed
with their reason in `src/test/native-props-allowlist.ts` (five custom interactive surfaces: the receipt-photo card row, the photo
thumbnails, the remove-photo hit area, the session bar and the tab-bar tab).

Differences from the boards that follow from the scale: form fields and sheet actions are 44px instead of 48 (xl carries `px-6` and 16px text, so the confirm footers of the sheets stack), the hero call to
action is 52px at every width, the dashboard's Start pills and empty-state buttons use the standard sizes, and the date pill and
status chips are `Badge` variants. Menu items are 44px (the sessions menu drew 48), the arrows over the photo viewer are 48 (`icon-2xl`,
drawn 52), "View All" is 32px at every width, and `Label` keeps the 20px line height of `text-sm`. Dark mode is deferred (11.4).

---

### 11.6 History and Add Items to List (phones)

- History: the group card reads `Completed on <date> · $total` (mono date, `text-xs`), with the footer count and a `View Details` link. The empty state is one card with the folder icon.
- Add Items to List is a bottom sheet below `md` (`DialogContent sheetOnPhones`). Cancel is `variant='secondary'`; Add is `size='primary'` and reads `Add N Items`, disabled until a list is chosen in the existing-list mode. The no-groups state offers one primary `Create Group` button.

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
