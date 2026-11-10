# DS implementation plan — Listys

- DS: docs/design/design-system.html — version v1.1.0
- Visual report: docs/design/audit-findings/report.html
- Status: awaiting approval (previews: docs/design/audit-findings/report.html#preview). Do not implement until this line says `approved <date>`; user adjustments, if any, are listed here when approved.
- Source audited: this repository @ a50e665, 2026-11-09 (run 1: whole app, working tree clean; runs 2 and 3: scoped, working tree has only the untracked DS and this folder)
- Open: 44 issues (Critical 0 · High 4 · Medium 24 · Low 16)
- Since last audit: run 2 (mode C, scope: the Prices by Store sheet against the references V4·17, V4·18 and V4·19). DS-001 to DS-023 stay open and were not re-verified in this run. New: DS-024 to DS-034 (Batch 4). Last used ID: DS-045. **Run 3 (mode C, scope: the trip receipt review, Change Line and the trip detail against references V4·11, V4·12, V4·13, V4·15 and V4·16):** new DS-035 to DS-045 (Batch 5); **DS-022 is withdrawn** (the references draw the cart on the Trips tab, so the DS rule "cart = start shopping only" is what changes: Open design decision 22); DS-026, DS-027, DS-020 and DS-030 gained locations.
- Stack detected: Next.js 16 (App Router), React 19, Tailwind CSS 4 (`@theme inline` in `src/app/globals.css`, tokens stored as OKLCH), shadcn components (`radix-ui` + `class-variance-authority`) in `src/components/ui/`, Hugeicons, next-themes with a `.dark` class. Fonts: Plus Jakarta Sans, Inter, IBM Plex Mono via `next/font`. The landing page (`src/app/(marketing)/`, `src/components/marketing/`) has its own documented exceptions and is out of scope of the DS.

## Instructions for the implementing agent
- Work through the batches in order (Batch 0 first): later batches assume the tokens from Batch 1 exist. Batch 4 (Prices by Store) starts with a note about a pending DS update: read it before implementing; it only needs DS-009 for the divider token and says what to use until then.
- Each issue is self-contained. When you finish one, tick its acceptance criteria and set its status to `done (pending verification)`.
- Don't change DS values to make the code match; if a DS value looks wrong, note it under the issue and leave it for the design owner.
- Don't implement items under "Open design decisions".
- Follow the repository rules in `AGENTS.md`: shadcn-native props and variants (`className` is for layout only), Tailwind only, theme tokens in `src/app/globals.css`, visual validation with Chrome DevTools at phone and desktop widths in light and dark.
- Don't edit `docs/design/design-system.html` or `docs/design/audit-findings/` except to tick criteria and set statuses in this file.
- Don't delete this file, `report.html` or `assets/`. When you're done, ask for the design-system audit to be run again (`/appds:verify`): it verifies the fixes, regenerates this folder, and empties it once everything is resolved and approved.

## Token map
The single reference for values. Code should consume these tokens instead of literals. "Dark" is specified in the DS and **not yet reviewed in the app** (see DS-010). Hex is the canonical value; the code stores OKLCH, which is acceptable and preferred. OKLCH for the changed values: #0F172A = `oklch(0.2077 0.0398 265.7549)`, #5B6B82 = `oklch(0.5233 0.0413 257.4182)`, #DBEAFE = `oklch(0.9319 0.0316 255.5855)`, #E2E8F0 = `oklch(0.9288 0.0126 255.5078)`, #1D4ED8 = `oklch(0.4882 0.2172 264.3763)`, #B91C1C = `oklch(0.5054 0.1905 27.5181)`, #93C5FD = `oklch(0.8091 0.0956 251.8128)`, #0B1120 = `oklch(0.1802 0.0325 266.6248)`, #111827 = `oklch(0.2101 0.0318 264.6645)`, #1E293B = `oklch(0.2795 0.0368 260.0310)`, #2A3750 = `oklch(0.3370 0.0477 262.9456)`, #172033 = `oklch(0.2449 0.0388 264.3540)`, #F8FAFC = `oklch(0.9842 0.0034 247.8575)`, #94A3B8 = `oklch(0.7107 0.0351 256.7878)`, #334155 = `oklch(0.3717 0.0392 257.2870)`, #475569 = `oklch(0.4455 0.0374 257.2808)`, #EEF0F3 = `oklch(0.9545 0.0046 258.3249)`, #D5DAE1 = `oklch(0.8866 0.0110 256.6993)`. Values for the remaining feedback, entity, collaboration and scan tokens are in the DS, Foundations › Color (convert them the same way).

| DS token | Light | Dark | Current code equivalent | Action |
|---|---|---|---|---|
| `text/primary` | #0F172A | #F8FAFC | `--foreground` #333333 / dark #E5E5E5 | change (DS-005, DS-010) |
| `text/secondary (ink-soft)` | #334155 | #E2E8F0 | none (slate-700 literal) | create (DS-009) |
| `text/body` | #475569 | #CBD5E1 | none (slate-600 literal) | create (DS-009) |
| `text/muted` | #5B6B82 | #94A3B8 | `--muted-foreground` #6B7280 / dark #A3A3A3 | change (DS-006, DS-010) |
| `text/faint` | #94A3B8 | #64748B | none (slate-400 literal) | create, decoration only (DS-009) |
| `text/on-inverse-muted` | #CBD5E1 | #CBD5E1 | none (slate-300 literal) | create (DS-009) |
| `bg/canvas` | #F2F4F7 | #0B1120 | `--background` #F2F4F7 / dark #171717 | light ✓, dark change (DS-010) |
| `bg/surface` | #FFFFFF | #111827 | `--card` #FFFFFF / dark #262626 | light ✓, dark change (DS-010) |
| `bg/surface-secondary` | #E9ECF0 | #1E293B | `--secondary` #E9ECF0 / dark #262626 | light ✓, dark change (DS-010) |
| `bg/surface-tertiary` | #DEE2E8 | #2A3750 | `--secondary-hover` #DEE2E8 / dark #333333 | light ✓, dark change (DS-010) |
| `bg/panel` | #F6F7F9 | #172033 | `--muted` #F6F7F9 / dark #1F1F1F | light ✓, dark change (DS-010) |
| `bg/inverse` | #0F172A | #1E293B | none (slate-900 literal) | create (DS-009) |
| `action/primary` | #2563EB | #60A5FA | `--primary`, `--ring` (exact) | aligned ✓ |
| `action/primary-hover` | #1D4ED8 | #93C5FD | none (`bg-primary/90`) | create (DS-009, DS-012) |
| `action/subtle` | #DBEAFE | #1E3A8A | `--accent` #E0F2FE / dark #1E3A8A | light change (DS-007), dark ✓ |
| `action/on-subtle` | #1E3A8A | #BFDBFE | `--accent-foreground` #1E3A8A / dark #BFDBFE | aligned ✓ |
| `text/on-action` | #FFFFFF | #0F172A | `--primary-foreground` (exact) | aligned ✓ |
| `border/default` | #E2E8F0 | #334155 | `--border`, `--input` #E5E7EB / dark #404040 | change (DS-008, DS-010) |
| `border/divider` | #EEF0F3 | #1E293B | none | create (DS-009) |
| `border/outline` | #D5DAE1 | #334155 | none (slate-200 literal) | create (DS-009) |
| `feedback/error-solid` | #DC2626 | #EF4444 | `--destructive` (exact in both themes) | aligned ✓ |
| `feedback/{success,warning,error,info}[-subtle,-tint]` | see DS Foundations | see DS Foundations | amber/green/red/blue 50/100/700 literals | create (DS-009) |
| `entity/{list,receipt,trip,store}[-on], collab/*, scan/*` | see DS Foundations | see DS Foundations | blue/cyan/green/violet literals | create (DS-009) |
| `radius/field (alerts, fields, menus)` | 16px | 16px | `rounded-2xl` (`--radius` 0.5rem + 8px): exact | aligned ✓ (alert base and destructive-soft: DS-016) |
| `text/on-inverse-action` | #93C5FD | #93C5FD | none (blue-300 literal) | create (DS-009, DS-023) |
| `feedback/*-strong (success #14532D, warning #78350F, error #7F1D1D, info #1E3A8A)` | see DS Foundations | see DS Foundations | green/amber/red/blue-900 literals | create (DS-009, DS-016) |

## Batch 0 — Source-of-truth handover
Do this before any other batch, so no agent keeps following the old sources. Deleting the old files is **not** listed here because the user has not yet confirmed which to delete (see Open design decisions); when they answer, a "Delete `<file>`" item per confirmed file is added to this batch. Files the user keeps must be relabelled as historical references that point to the DS.

### DS-001 · Point AGENTS.md to the new DS as the only design source · High
- **Type:** reference update
- **Where:** `AGENTS.md:489-491` (section "Documentation Ownership")
- **DS reference:** Overview (docs/design/design-system.html#overview)
- **Current text:** "- [docs/design/listys-design-system.html](docs/design/listys-design-system.html) is the canonical visual reference; [docs/design/DESIGN.md](docs/design/DESIGN.md) owns the written rules, implementation mapping, and documented gaps. `docs/design/audit-findings/` is managed by the `build-app-design-system` skill (see "Design System")."
- **Replace with:** "- [docs/design/design-system.html](docs/design/design-system.html) is the only source of truth for UI: tokens, components and patterns. `docs/design/audit-findings/` is managed by the `build-app-design-system` skill (see "Design System")."
- **Why it matters:** AGENTS.md currently tells every agent that two older files are canonical, competing with the new DS.
- **Acceptance criteria:**
  - [ ] `AGENTS.md` names `docs/design/design-system.html` as the only source of truth
  - [ ] Searching AGENTS.md for `DESIGN.md` and `listys-design-system.html` finds nothing (unless the user chose to keep them, then only as "historical reference")
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-001
- **Status:** open

### DS-002 · Update the DS workflow doc: the DS now exists · High
- **Type:** reference update
- **Where:** `docs/contributing/design-system-workflow.md:10-11` (status line); `:13-21` (section "Older design documents"); `:25-26`, `:31-33`, `:37-38` ("until it exists" clauses); `:48` (table row "The DS does not exist yet (today)")
- **DS reference:** Overview (docs/design/design-system.html#overview)
- **Current text:** Line 10: "**Status: the DS has not been initialized yet.** Until `docs/design/design-system.html` exists, the older design documents below stay authoritative…"
- **Replace with:** Line 10: "**Status: the DS exists** (`docs/design/design-system.html`, v1.1.0) and is the only source of truth." Remove or relabel the "Older design documents" section as "Historical references (not canonical)" (or delete it if the user confirmed deleting both files). Drop every "until it exists / until the DS exists" clause in "Before you write UI" (read the DS; no fallback to `DESIGN.md` or the old HTML; no "the HTML wins" rule). In the table, change the Init row to "Only if the DS file is ever lost: `/appds:init`".
- **Why it matters:** The workflow tells agents to follow `DESIGN.md` and the old HTML "until the DS exists" and to keep `DESIGN.md` in sync, which would keep two sources alive.
- **Acceptance criteria:**
  - [ ] No sentence says the DS is missing or tells agents to follow `DESIGN.md` or the old HTML
  - [ ] The gate, audit, verify and update rows are unchanged
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-002
- **Status:** open

### DS-003 · Repoint remaining docs and agent notes that cite the old sources · Medium
- **Type:** reference update
- **Where:** `docs/contributing/CONTRIBUTING.md:6`; `docs/README.md:21`; `README.md:59`; `PRODUCT.md:81` ("The blue-and-cyan palette recorded in `docs/design/DESIGN.md` is binding"); `docs/reference/implementation-status.md:20`, `:219`, `:274`, `:289` (links to DESIGN.md §11.4 gaps); `.impeccable/surfaces/src-components-marketing-landing-page.md:20`, `:28`
- **DS reference:** Overview (docs/design/design-system.html#overview)
- **Current text:** Each cites `docs/design/DESIGN.md` and/or `docs/design/listys-design-system.html` as the design reference.
- **Replace with:** Link `docs/design/design-system.html` instead (for gap lists: link the DS "Open decisions" on its Overview and the findings of the latest audit). In `PRODUCT.md:81` say "the palette in the Design System (`docs/design/design-system.html`) is binding". Leave `CHANGELOG.md` untouched: it is history.
- **Why it matters:** Humans and agents following these links land on the superseded documents.
- **Acceptance criteria:**
  - [ ] Searching the repo (excluding `CHANGELOG.md`, `openspec/changes/archive/` and the old files themselves) for `DESIGN.md` and `listys-design-system.html` finds nothing that presents them as canonical
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-003
- **Status:** open

### DS-004 · Remove code comments that cite DESIGN.md sections · Low
- **Type:** code comment
- **Where:** `src/components/features/dashboard/dashboard-row.tsx:10` ("…set in mono (DESIGN.md §4.1)"); `src/components/features/dashboard/up-next-list.tsx:11` ("…tones of DESIGN.md §3.3…")
- **DS reference:** Foundations › Typography, Color (docs/design/design-system.html#foundations)
- **Current text:** Comments cite `DESIGN.md` section numbers.
- **Replace with:** Cite "Design System › Typography (Mono)" and "Design System › Color (feedback tokens)". Keep the existing explanation of why.
- **Why it matters:** Section numbers of a superseded file go stale and point agents to it.
- **Acceptance criteria:**
  - [ ] No comment under `src/` references `DESIGN.md`
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-004
- **Status:** open

## Batch 1 — Foundations (tokens and styles)

### DS-005 · Foreground (ink) is neutral grey #333333, not slate ink #0F172A · Medium
- **Type:** misaligned: token
- **Where:** `src/app/globals.css:12` `--foreground`; `:14` `--card-foreground`; `:16` `--popover-foreground`; `:40` `--sidebar-foreground` (all light theme)
- **DS reference:** Foundations › Color › text/primary (docs/design/design-system.html#foundations)
- **Expected:** text/primary #0F172A = `oklch(0.2077 0.0398 265.7549)` (the code already uses this exact value for the dark `--primary-foreground`)
- **Observed:** `oklch(0.3211 0 0)` = #333333, a neutral grey
- **Why it matters:** Headings, item names and values lose the navy ink that defines the palette; every screen reads greyer than designed.
- **Fix guidance:** Set the four light-theme foreground variables to the DS ink value. Do not touch the dark theme here (DS-010).
- **Acceptance criteria:**
  - [ ] `--foreground`, `--card-foreground`, `--popover-foreground`, `--sidebar-foreground` resolve to #0F172A in light mode
  - [ ] Body text on the canvas measures 16.2:1
  - [ ] A visual check of dashboard, lists and a receipt shows no unintended color change
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-005
- **Status:** open

### DS-006 · Muted text fails AA on the canvas (4.39:1) · High
- **Type:** misaligned: token, accessibility
- **Where:** `src/app/globals.css:24` `--muted-foreground`
- **DS reference:** Foundations › Color › text/muted (docs/design/design-system.html#foundations)
- **Expected:** text/muted #5B6B82 = `oklch(0.5233 0.0413 257.4182)`: 4.92:1 on canvas #F2F4F7, 4.58:1 on #E9ECF0, 5.43:1 on white
- **Observed:** `oklch(0.5510 0.0234 264.3637)` = #6B7280 (grey, not slate): 4.39:1 on canvas, below the 4.5:1 AA minimum for normal text
- **Why it matters:** Descriptions, metadata and placeholders use this color at 12–14px on the canvas and fail WCAG 1.4.3 (and 78 `text-slate-500` call sites sit at #64748B, which is 4.32:1: see DS-020).
- **Fix guidance:** Change `--muted-foreground` to the DS value. Placeholders already use it (`input.tsx`), so they improve too.
- **Acceptance criteria:**
  - [ ] `--muted-foreground` resolves to #5B6B82 in light mode
  - [ ] Contrast of `text-muted-foreground` on `bg-background`, `bg-card` and `bg-secondary` is ≥ 4.5:1 (measured: 4.92, 5.43, 4.58)
- **Depends on:** none
- **Evidence:** static source + computed contrast
- **Visual:** report.html#ds-006
- **Status:** open

### DS-007 · Accent surface is sky blue #E0F2FE, DS uses blue #DBEAFE · Medium
- **Type:** misaligned: token
- **Where:** `src/app/globals.css:25` `--accent`; `:43` `--sidebar-accent`
- **DS reference:** Foundations › Color › action/subtle (docs/design/design-system.html#foundations)
- **Expected:** action/subtle #DBEAFE = `oklch(0.9319 0.0316 255.5855)`
- **Observed:** `oklch(0.9514 0.0250 236.8242)` = #E0F2FE (sky-100)
- **Why it matters:** This is the hover and current-item highlight of the sidebar, tab bar, menus and selected rows; it reads cyan-tinted instead of the blue of the action family. `--accent-foreground` (#1E3A8A) already matches.
- **Fix guidance:** Set both variables to the DS value. Keep the dark values (they already equal #1E3A8A).
- **Acceptance criteria:**
  - [ ] `--accent` and `--sidebar-accent` resolve to #DBEAFE in light mode
  - [ ] `#1E3A8A` text on it stays ≥ 4.5:1 (measured 8.5:1)
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-007
- **Status:** open

### DS-008 · Hairline border is grey-200 #E5E7EB, DS border/default is slate #E2E8F0 · Low
- **Type:** misaligned: token
- **Where:** `src/app/globals.css:30` `--border`; `:31` `--input`; `:45` `--sidebar-border`
- **DS reference:** Foundations › Color › border/default (docs/design/design-system.html#foundations)
- **Expected:** border/default #E2E8F0 = `oklch(0.9288 0.0126 255.5078)`
- **Observed:** `oklch(0.9276 0.0058 264.5313)` = #E5E7EB
- **Why it matters:** Same lightness, different hue family: the hairlines are neutral where every other neutral is slate.
- **Fix guidance:** Update the three variables to the DS value.
- **Acceptance criteria:**
  - [ ] The three variables resolve to #E2E8F0 in light mode
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-008
- **Status:** open

### DS-009 · Add the semantic tokens components currently fake with slate/amber/green literals · Medium
- **Type:** missing tokens
- **Where:** `src/app/globals.css` (`:root`, `.dark` and `@theme inline`)
- **DS reference:** Foundations › Color (docs/design/design-system.html#foundations)
- **Expected:** Tokens for text (secondary, body, faint, on-inverse, on-inverse-muted, on-inverse-action), bg/inverse, border/divider and border/outline, action hover, feedback (success, warning, error, info with subtle, tint and strong), entity (list, receipt, trip, store), collaboration and scan. Values are in the token map below; register them in `@theme inline` as `--color-*` so Tailwind exposes them (e.g. `text-body`, `bg-inverse`, `bg-feedback-info-tint`).
- **Observed:** None exist. Components use literals instead: 78 files outside the landing page use `slate-*` utilities (see DS-020), badges use `amber-100/700`, `green-100/700`, `blue-100/700`, `violet-*`, alerts use `blue-500/10`, buttons use `bg-primary/90` for hover (DS-012).
- **Why it matters:** Without tokens the DS values cannot be changed in one place, dark mode needs per-call-site `dark:` classes, and contrast fixes (DS-006) do not reach literal uses.
- **Fix guidance:** Add the tokens with light and dark values from the token map. Keep shadcn-compatible names for the existing ones; add new names only for roles shadcn lacks. Do not add a second color system in `tailwind.config.ts`. No component changes in this issue.
- **Acceptance criteria:**
  - [ ] Every token in the map exists in `:root` and `.dark` and is registered in `@theme inline`
  - [ ] Each resolves to the DS hex (light) and the DS dark hex
  - [ ] No hex literals are introduced in components
- **Depends on:** DS-005, DS-006, DS-007, DS-008
- **Evidence:** static source
- **Visual:** report.html#ds-009
- **Status:** open

### DS-010 · Dark theme is neutral grey; the DS specifies navy · Medium
- **Type:** misaligned: token (dark mode)
- **Where:** `src/app/globals.css:66-115` (`.dark`)
- **DS reference:** Foundations › Color (Dark column) (docs/design/design-system.html#foundations)
- **Expected:** See the dark column of the token map (canvas #0B1120, surface #111827, secondary #1E293B, text #F8FAFC / #94A3B8, border #334155).
- **Observed:** `--background` #171717, `--card` #262626, `--foreground` #E5E5E5, `--muted-foreground` #A3A3A3, `--border` #404040: pure grey. Already equal to the DS: `--primary` #60A5FA, `--primary-foreground` #0F172A, `--accent` #1E3A8A, `--destructive` #EF4444.
- **Why it matters:** The DS defines navy surfaces so dark mode keeps the brand; today it is generic grey. **Pending assumption:** the user chose to specify navy dark mode but it has never been reviewed in the app.
- **Fix guidance:** Replace the neutral values in `.dark` with the DS dark values, then review each core screen in dark (DESIGN.md already requires light and dark review before a component is complete).
- **Acceptance criteria:**
  - [ ] `.dark` variables resolve to the DS dark values in the map
  - [ ] Dashboard, lists, a trip and a receipt reviewed visually in dark with no unreadable text (≥ 4.5:1)
  - [ ] Images and the logo are not color-inverted
- **Depends on:** DS-009
- **Evidence:** static source (dark rendering not verified)
- **Visual:** report.html#ds-010
- **Status:** open

### DS-011 · tailwind.config.ts is a v3 leftover that Tailwind v4 never loads · Low
- **Type:** dead config
- **Where:** `tailwind.config.ts:13-53` (colors wrapped as `hsl(var(--x))`); `components.json:11` (`"config": "tailwind.config.ts"`)
- **DS reference:** Foundations › Color (docs/design/design-system.html#foundations)
- **Expected:** One color system: the tokens in `globals.css`.
- **Observed:** The config maps colors to `hsl(var(--background))` etc. while the variables hold OKLCH values; `globals.css` has no `@config` directive, so v4 ignores the file. The only live content is the `blob` animation (marketing).
- **Why it matters:** A second, broken-looking color system invites wrong edits (DESIGN.md §11.1 forbids it).
- **Fix guidance:** Confirm nothing else loads it, move the `blob` keyframes next to the marketing styles if still used, set `components.json` `tailwind.config` to an empty string (the v4 convention) and delete the file.
- **Acceptance criteria:**
  - [ ] `tailwind.config.ts` is gone and the app builds and renders unchanged
  - [ ] `components.json` no longer points to it
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-011
- **Status:** open

## Batch 2 — Core components

### DS-012 · Primary and danger hover lighten instead of darkening · Medium
- **Type:** misaligned: interaction state
- **Where:** `src/components/ui/button.tsx:21` default; `:26` destructive; `:31` hero; `:33` fab
- **DS reference:** Core Components › Button › Hover (docs/design/design-system.html#c-button)
- **Expected:** Hover primary #1D4ED8 (action/primary-hover, `oklch(0.4882 0.2172 264.3763)`); hover danger #B91C1C (`oklch(0.5054 0.1905 27.5181)`). Dark: #93C5FD.
- **Observed:** `hover:bg-primary/90` and `hover:bg-destructive/90`: a 90% blend toward the page behind, about #3A72EC on the canvas (lighter than the rest color)
- **Why it matters:** Every primary action gives a lighter-on-hover feedback; the DS and the secondary/tertiary buttons darken. Opacity blends also change with the background.
- **Fix guidance:** Use the hover tokens from DS-009 (`--primary-hover`, `--destructive-hover`) instead of opacity.
- **Acceptance criteria:**
  - [ ] Hovering default, hero and fab shows #1D4ED8; destructive shows #B91C1C (light)
  - [ ] White text on the hover fill ≥ 4.5:1 (measured 6.7:1 and 6.5:1)
  - [ ] Dark theme hover is the DS dark value with ink text
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-012
- **Status:** open

### DS-013 · No pressed state · Medium
- **Type:** misaligned: interaction state
- **Where:** `src/components/ui/button.tsx:17` (base classes; no `active:` rule anywhere in the file)
- **DS reference:** Core Components › Button › Pressed (docs/design/design-system.html#c-button)
- **Expected:** Pressed scales to 97% on the hover color; no transform under `prefers-reduced-motion`.
- **Observed:** Nothing happens on `:active`.
- **Why it matters:** Pressing a button on a phone gives no immediate feedback, which is the primary one-handed shopping interaction.
- **Fix guidance:** Add an `active:` style to the base classes (scale 0.97, hover color) with `motion-reduce:active:scale-100`. Respect `disabled`.
- **Acceptance criteria:**
  - [ ] Pressing any enabled button scales it to 97% and shows the hover color
  - [ ] No scaling with reduced motion
  - [ ] Disabled buttons do not react
- **Depends on:** DS-012
- **Evidence:** static source
- **Visual:** report.html#ds-013
- **Status:** open

### DS-014 · Outline variant is a white bordered button with blue icons · Medium
- **Type:** misaligned: variant
- **Where:** `src/components/ui/button.tsx:13-14` `SECONDARY_BUTTON_STYLE` and `:22` `outline`; Used in 10 files, e.g. `features/dashboard/dashboard-greeting.tsx`, `features/list-items/add-item-sheet.tsx`, `features/sharing/share-list-dialog.tsx`, `app/error.tsx`
- **DS reference:** Core Components › Button › Outline (docs/design/design-system.html#c-button)
- **Expected:** Transparent fill, ink text, 1px inset ring #D5DAE1 (border/outline), hover fill #F2F4F7 (bg/canvas); glyph inherits the text color.
- **Observed:** `bg-card` fill, `border-slate-200` border, `hover:border-slate-300 hover:bg-slate-50`, and `[&_svg]:text-primary` (blue glyphs)
- **Why it matters:** Share and Add Item sit on the page ground in every list; they currently look like white buttons with blue icons.
- **Fix guidance:** Rebuild the variant from the DS tokens (inset ring via a shadow/ring utility using the new outline token).
- **Acceptance criteria:**
  - [ ] Outline shows the DS fill, ring, hover and ink glyph in light and dark
  - [ ] Focus ring still shows (the ring and the focus ring must not clash)
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-014
- **Status:** open

### DS-015 · A receipt being read shows amber, the same as Pending · High
- **Type:** misaligned: status color
- **Where:** `src/components/ui/badge.tsx:23` `processing`; `src/components/features/tickets/helpers/ticket-status.ts:14` (`processing: { label: "Reading Receipt", tone: "bg-amber-100 text-amber-700 …" }`); `src/components/features/tickets/receipt/ticket-item-row.tsx:28` (`"No price"` uses `variant: "processing"`)
- **DS reference:** Core Components › Badge › Status (docs/design/design-system.html#c-badge)
- **Expected:** Reading = feedback/info-tint (#DBEAFE) with feedback/info text (#1D4ED8), 6px dot. Pending stays amber. "No price" is an attention **tag** (amber-50 fill, amber-200 ring, icon), not a status pill.
- **Observed:** `processing` is `bg-amber-100 text-amber-700`, identical to `pending` (line 29); the receipt status map copies the same amber tone
- **Why it matters:** Pending and Reading are indistinguishable and blue (in progress) is not used where the DS says it should be. Labels are not part of this issue (the Ready/Processed wording is an open copy decision in the old docs).
- **Fix guidance:** Make `processing` the blue tint (it can share the `shopping` look), update the tone in `ticket-status.ts`, and render "No price" with `tag-attention` plus its icon.
- **Acceptance criteria:**
  - [ ] A receipt in Reading shows blue; Pending shows amber
  - [ ] "No price" renders as the attention tag with an icon
  - [ ] Dark theme tints follow the DS dark values
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-015
- **Status:** open

### DS-016 · Alert base and destructive-soft radii (8/12px) and translucent tones differ from the DS (16px, icon tile, tonal fills) · Medium
- **Type:** misaligned: component
- **Where:** `src/components/ui/alert.tsx:7` base `rounded-lg` (8px); `:14` `destructive-soft` `rounded-xl` (12px); `:15-17` `info` and `warning` (`bg-blue-500/10`, `border-blue-500/60`, whole alert `text-blue-700`); `:18` `receipt-warning` is `rounded-2xl` (16px) and already matches the radius; Used in `features/shopping-sessions/trip-receipts-card.tsx`, `features/tickets/receipt/ticket-items-card.tsx`, `ticket-items-list.tsx`, `app/(authenticated)/invite/[token]/page.tsx`
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert)
- **Expected:** Radius 16px (radius/field, `rounded-2xl`) for every variant; 12px padding and gap; a 32px icon tile (8px radius) in feedback/*-tint with the 700 icon; fill feedback/*-subtle with a 1px inset feedback/*-tint ring; title Inter 600/14 in feedback/*-strong; body Inter 14/21 in text/body; optional actions row of 32px buttons 8px apart.
- **Observed:** Base 8px and destructive-soft 12px against 16px in `receipt-warning`; `info` and `warning` tint the entire alert text and use 10%-opacity fills over the page; no icon tile
- **Why it matters:** One component, three radii; translucent fills change with the background and are harder to keep AA in dark mode. The 16px value is taken from the old HTML reference (the written spec said 22px, off the radius scale).
- **Fix guidance:** Use `rounded-2xl` for all variants and rebuild the tones with the DS-009 feedback tokens (subtle, tint, strong). Keep the variant names callers already use.
- **Acceptance criteria:**
  - [ ] All alert variants render at 16px radius
  - [ ] Icon sits in a 32px tile; title uses the 900 color, body uses text/body
  - [ ] No `/10` or `/60` opacity colors remain in `alert.tsx`
- **Depends on:** DS-009
- **Evidence:** static source
- **Visual:** report.html#ds-016
- **Status:** open

### DS-017 · Default card title is weight 500, DS card title is 600 · Medium
- **Type:** misaligned: typography
- **Where:** `src/components/ui/card.tsx:93` `cardTitleVariants` `default: "text-base font-medium"`
- **DS reference:** Foundations › Typography › H6 (card title) (docs/design/design-system.html#foundations)
- **Expected:** 600 16px/1.5, −.005em, Plus Jakarta Sans
- **Observed:** `text-base font-medium` (500), no display face or tracking
- **Why it matters:** Every `CardTitle` using the default is lighter than the card titles drawn in the DS.
- **Fix guidance:** Set the default variant to semibold with display face and `tracking-tight`-equivalent spacing from the native scale.
- **Acceptance criteria:**
  - [ ] `CardTitle` default renders 600 16px in the display face
  - [ ] No call site overrides it with `className`
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-017
- **Status:** open

### DS-018 · Card variants premium, accent and ghost add borders the DS forbids · Low
- **Type:** unused variants
- **Where:** `src/components/ui/card.tsx:50-53` (`premium`: `border … ring-1`, `accent`: `border border-primary/30 bg-primary/5`, `ghost`: `border-dashed border-2`)
- **DS reference:** Foundations › Elevation and borders (docs/design/design-system.html#foundations)
- **Expected:** Cards have no border; dashed borders only for drop zones and create-new tiles.
- **Observed:** Three variants that draw borders or rings. A search of `<Card` usages found none using them (usage not proven exhaustive).
- **Why it matters:** Dead variants invite a one-off look; `--shadow-premium` exists only for the first.
- **Fix guidance:** Confirm with a repo-wide search; remove the unused variants and `--shadow-premium`, or document a real use in the DS.
- **Acceptance criteria:**
  - [ ] The variants and their shadow token are removed (or the DS lists them with a use)
  - [ ] No visual change on any screen
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-018
- **Status:** open

### DS-019 · Unchecked checkbox boundary is #94A3B8 (2.56:1) and sizes are 16/22px · Medium
- **Type:** misaligned: component, accessibility
- **Where:** `src/components/ui/checkbox.tsx:16` default `h-4 w-4 rounded-sm border-primary`; `:18` lg `size-5.5 rounded-md border-slate-400 bg-white`
- **DS reference:** Core Components › Checkbox, radio and switch (docs/design/design-system.html#c-checkbox)
- **Expected:** 20px box, 6px radius, unchecked boundary text/muted #5B6B82 (5.43:1 on white), 44px hit area; checked = action/primary fill.
- **Observed:** The large (list) box uses slate-400 = 2.56:1 on white, below the 3:1 of WCAG 1.4.11; sizes are 16px and 22px; radius `rounded-sm`/`rounded-md`
- **Why it matters:** The unchecked state of the most-used control on the shopping screen is hard to see. **Pending assumption:** the single 20px size is a DS decision resolving a conflict inside the old spec (§7.2 says 20, §11.5 says 16/22).
- **Fix guidance:** Use one 20px size (keep the 44px target on rows), the muted boundary token and the 6px radius token.
- **Acceptance criteria:**
  - [ ] Unchecked boundary ≥ 3:1 against white and canvas
  - [ ] Box is 20px with 6px radius; row hit area ≥ 44×44px
  - [ ] Checked and indeterminate unchanged
- **Depends on:** DS-009
- **Evidence:** static source + computed contrast
- **Visual:** report.html#ds-019
- **Status:** open

### DS-023 · Toast is the stock shadcn toast, not the dark inverse toast of the DS · Medium
- **Type:** misaligned: component
- **Where:** `src/components/ui/toast.tsx` `toastVariants` (`rounded-md border p-6 pr-8 shadow-lg`; default `border bg-background text-foreground`); `ToastAction` (`h-8 rounded-md border bg-transparent px-3 hover:bg-secondary`); `ToastClose` (lucide `X`); `ToastViewport` (`fixed top-4`, top centre)
- **DS reference:** Core Components › Toast (docs/design/design-system.html#c-toast)
- **Expected:** bg/inverse surface (#0F172A, dark #1E293B), 16px radius, no border, padding 8px 8px 8px 16px, 12px gap, menu shadow; a 20px success glyph, the message Inter 500/14 in text/on-inverse; the action ("Undo") a 32px borderless text button, 12px radius, in text/on-inverse-action (#93C5FD). On phones it sits above the tab bar.
- **Observed:** Default variant is a bordered white/background card with 24px padding and a 6px radius; the action is an outlined button; the close is a Lucide icon; it appears at the top centre
- **Why it matters:** Every confirmation ("6 items added to Pantry" with Undo) looks like a different app than the rest of the interface; the destructive variant also uses the solid red button color for a whole toast.
- **Fix guidance:** Rebuild the default variant on the DS-009 inverse tokens and the 16px radius; style the action as a text button; replace the Lucide close with Hugeicons (DS-021). Keep the destructive variant only if a use exists.
- **Acceptance criteria:**
  - [ ] A confirmation toast renders on the inverse surface with the success glyph and a text "Undo"
  - [ ] Text and action contrast ≥ 4.5:1 on the toast in light and dark
  - [ ] No border or 24px padding remains; reduced motion removes the slide
- **Depends on:** DS-009, DS-021
- **Evidence:** static source
- **Visual:** report.html#ds-023
- **Status:** open

## Batch 3 — Patterns and screens

### DS-020 · Replace slate literals with semantic tokens (78 files outside the landing page) · Medium
- **Type:** token not used
- **Where:** 78 files under `src/components/**` and `src/app/**` excluding `components/marketing/` and `app/(marketing)/`: 78 × `text-slate-500`, 21 × `text-slate-600`, 16 × `text-slate-400`, 14 × `bg-slate-900`, 10 × `text-slate-700`, 10 × `bg-slate-100`, 9 × `text-slate-300`, 9 × `border-slate-100`, 5 × `text-slate-900`, 4 × `border-slate-200` (counts are occurrences of each class in those files). Run 2 confirmed this includes `features/base-lists/items/item-store-prices-sheet.tsx` (7 × `text-slate-500`) and `commons/stat-tile/stat-tile.tsx` (labels), where `text-slate-500` sits on the #F6F7F9 panel at 4.44:1 (below AA); Batch 4 rebuilds those lines, so migrate them there. Run 3: the left-out lines of the trip review (`features/tickets/attach/trip-review-line-row.tsx:17-18`) use `text-slate-400` with a strike-through on the panel at 2.39:1; move them to `text/muted` (5.06:1) and keep the strike-through, which carries the meaning.
- **DS reference:** Foundations › Color (docs/design/design-system.html#foundations)
- **Expected:** Components consume semantic tokens: `text-slate-500` → `text-muted-foreground`; `-600` → `text-body`; `-700` → `text-secondary` role (ink-soft); `-900` → `text-foreground`; `-400` → `text-faint` for decoration only, otherwise `text-muted-foreground`; `bg-slate-900` → `bg-inverse`; `text-slate-300` on inverse → `text-on-inverse-muted`; `bg-slate-100` → `bg-secondary` or `bg-muted`; `border-slate-100/200` → `border-border`.
- **Observed:** Literals. Examples: `text-slate-500` is #64748B, 4.32:1 on canvas; `text-slate-400` is #94A3B8, 2.56:1.
- **Why it matters:** Literals bypass the contrast fix (DS-006), do not flip in dark mode and make the palette impossible to change in one place.
- **Fix guidance:** Migrate one feature at a time (receipts, lists, trips, dashboard, shell), checking each visually in light and dark; where `text-slate-400` carries meaning, switch to muted instead of faint.
- **Acceptance criteria:**
  - [ ] No `text-slate-500/600/700/900`, `bg-slate-900` or `border-slate-100/200` remain outside the landing page
  - [ ] Remaining `slate-400` uses are decorative (chevrons, disabled glyphs) and documented in a code comment
  - [ ] No text/background pair below 4.5:1 introduced
- **Depends on:** DS-005, DS-006, DS-009, DS-010
- **Evidence:** static source (counts from a text search)
- **Visual:** report.html#ds-020
- **Status:** open

### DS-021 · Seven files still use Lucide icons; the project standard is Hugeicons · Low
- **Type:** misaligned: icon family
- **Where:** `src/components/ui/dialog.tsx`, `ui/radio-group.tsx`, `ui/toast.tsx`; `src/components/app/sidebar/nav-group.tsx`; `src/components/features/pwa/install-app-button.tsx`; `src/app/error.tsx`, `src/app/(authenticated)/error.tsx`
- **DS reference:** Foundations › Iconography and brand (docs/design/design-system.html#foundations)
- **Expected:** Hugeicons only (`components.json` already sets `"iconLibrary": "hugeicons"`; 105 files use it).
- **Observed:** `lucide-react` imported in the seven files listed
- **Why it matters:** Two icon families differ in stroke and optical size.
- **Fix guidance:** Replace each icon with its Hugeicons equivalent, reviewing optical size and accessible labels, then remove the dependency if nothing else uses it.
- **Acceptance criteria:**
  - [ ] No `lucide-react` import under `src/` (the scan script mention is not code)
  - [ ] Icon-only buttons keep their accessible names
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-021
- **Status:** open

## Batch 4 — Prices by Store sheet (reference V4·17, V4·18, V4·19)
Scope of the second run. The user supplied three reference screens (`docs/design/audit-findings/assets/prices-by-store-reference.png`): V4·17 "in the existing sheet" (several stores), V4·18 "one store" and V4·19 "no data yet", and afterwards an **updated reference** (`assets/prices-by-store-reference-v2.png`, a crop of the V4·17 sheet down to the second row) that the user asked to follow. **Where v2 and V4·17 differ, v2 wins.** V4·18 and V4·19 were not redrawn; this plan keeps their content (the info callouts, the full-width buttons) and gives them the v2 look (assumption in Pending assumptions). The sheet is `src/components/features/base-lists/items/item-store-prices-sheet.tsx`, opened from the "Prices by Store" action of a list item row (owner only).

**Read this first.** The reference is newer than DS v1.1.0: the DS specimen (Patterns › Sheets, `#p-sheets`) shows an earlier layout (no icons on the stat tiles, tag under the price, "Lowest on last receipts", dates as "Feb 19", right-aligned footer button, no single-store or empty state). Expected values below come from the updated reference plus tokens and components the DS already defines. Where the reference departs from a DS rule, the issue follows the reference and the departure is listed as a suggestion under Open design decisions (10, 12 and 16) so the owner can align it with the DS later; the report shows both versions. Where the DS has no definition yet the issue says **(pending DS update)**. Recommended order: run `/appds:update` once so the DS absorbs the reference (see Open design decision 8), then implement this batch. Don't edit the DS from here.

Tokens this batch uses, all in the Token map: `bg/panel`, `border/divider`, `text/primary`, `text/body`, `text/muted`, `feedback/info-{subtle,tint,strong}`, `feedback/error`, `entity/store`. Until DS-009 creates them, use the closest existing semantic token (`--muted` for `bg/panel`, `--muted-foreground` for `text/muted`) and never add a slate or hex literal.

Already aligned (no issue): the sheet shell (bottom sheet on phones with 36×4 grabber, title on the left, 44px close, 24px top radius, centred dialog from `sm` at 520px), the tag shape (22px, 6px radius, 1px ring #E2E8F0, text #334155, 13px icon), the price (mono 600/14, tabular, right-aligned), the panel colour (`--muted` = #F6F7F9) and radius (16px), the "Cheapest" rule (only among at least two prices with the same normalized unit), the "different units" notice, long store names truncating with the full name in the DOM, and the date format "21 Feb" (it already matches the reference; the DS specimen is the outdated one).

### DS-024 · The empty state is skipped when the item has a usual store, so the sheet shows 0 / — / — tiles, a "0 times" row and a false one-store hint · Medium
- **Type:** misaligned: state
- **Where:** `src/components/features/base-lists/items/item-store-prices-sheet.tsx:31-33` (rows), `:38-43` (tiles and heading, always rendered), `:45` and `:67` (empty state only when `rows.length === 0`), `:68` (hint when `rows.length === 1`); `src/components/features/base-lists/items/helpers/item-store-summary.ts:93-95` (adds a placeholder history row for the usual store); call site `base-list-item-row.tsx:122-132` passes `history={item.store_history}`
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets); reference V4·19
- **Expected:** An item with no recorded purchase and no price at any store shows only the empty state (DS-025): no stat tiles, no "Last price by store" heading, no store rows and no one-store hint.
- **Observed:** `buildItemStoreSummary` appends `{ purchase_count: 0, last_price: null }` for the usual store when it has no stats row, so `rows.length` is 1, not 0. The sheet then renders the three tiles ("0", "—", "—"), a row "No price yet · 0 times" and the hint "Bought at one store so far…", which is false because nothing was bought. The existing unit test for the empty state passes `prices` without `history`, so it does not cover this path.
- **Why it matters:** The V4·19 situation (an item added by hand that has a usual store) is exactly the one that renders wrongly, and the copy states something untrue.
- **Fix guidance:** Decide "has history" from the rows: at least one with `purchase_count > 0` or a non-null `last_price`. When none, render the empty state and skip tiles, heading and hint. Show the one-store hint only when exactly one row has history. A store with purchases but no price stays listed ("No price yet · 2 times"). Add Vitest cases in `tests/item-store-prices-sheet.test.ts`: history containing only the usual-store placeholder → empty state and no tiles; one row with `purchase_count: 1` and no price → listed with the hint.
- **Acceptance criteria:**
  - [ ] Item with a usual store and no receipts shows the empty state and none of: tiles, heading, "0 times", "Bought at one store so far"
  - [ ] Item with one store and purchases keeps the row, the tiles and the hint
  - [ ] The two new behaviour tests pass (`pnpm test`)
- **Depends on:** none
- **Evidence:** static source (runtime not verified: confirm with an item that has a manual usual store and no receipts)
- **Visual:** report.html#ds-024
- **Status:** open

### DS-025 · Empty state is a centred grey card with "Upload a Receipt"; the reference is an info callout and a full-width primary button · Medium
- **Type:** misaligned: component
- **Where:** `item-store-prices-sheet.tsx:67` (`Card size='saved' tone='muted' variant='stat'`, `h3`, `p`, `UploadTicketDialog label='Upload a Receipt'`)
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert); reference V4·19
- **Expected:** `Alert` variant `info`: 16px radius, 12px padding and gap, a 32px icon tile (8px radius, `feedback/info-tint`, 700 icon, `InformationCircleIcon`), title "No prices yet" Inter 600/14 in `feedback/info-strong`, body Inter 14/21 in `text/body`: "Prices come from your receipts. Upload one with this item to see what it costs and where." Left-aligned. The upload button sits below it, outside the callout, full width, primary, 44px (DS-026), label "Upload New Receipt".
- **Observed:** a neutral `bg-muted` card with centred text; title `text-base font-semibold`, body `text-sm text-slate-500` ("Upload one after a trip to see what you paid at each store."), and the button inside the card with the label "Upload a Receipt". The app uses five labels for this action (Upload Receipt, Upload a Receipt, Upload New Receipt, Upload a New Receipt, Upload Another Receipt): see Open design decision 15.
- **Why it matters:** The empty state is the one place that tells people what to do; as a grey card it reads as inert, and the callout form already exists in the DS.
- **Fix guidance:** Use `Alert` (`info`) with `AlertTitle` and `AlertDescription`; override its default `role="alert"` with `role="status"`, because the DS says info is polite and this callout is not an error. Pass the label through `UploadTicketDialog`'s `label` prop. Keep the upload glyph the dialog adds (the reference omits it; see design observations). Alert tones are being rebuilt in DS-016: do not restyle the Alert here, only use it.
- **Acceptance criteria:**
  - [ ] The empty state shows an info Alert with icon, title and body, then a full-width primary button below it
  - [ ] The Alert has `role="status"`
  - [ ] No `Card size='saved'` remains in the sheet
- **Depends on:** DS-024, DS-026 (button), DS-016 (visual tones, can land after)
- **Evidence:** static source
- **Visual:** report.html#ds-025
- **Status:** open

### DS-026 · Footer buttons are 40px tall on phones and "Change Usual Store" uses the outline variant; the DS sheet footer is 44px and the reference uses the grey secondary button · Medium
- **Type:** misaligned: variant, touch target
- **Where:** `item-store-prices-sheet.tsx:69` (`variant='outline' size='primary'`); the upload trigger inside `UploadTicketDialog` (`upload-ticket-dialog.tsx:94`, default `size='primary'`); run 3: the same `size='primary'` footers in `features/tickets/attach/attach-to-session-dialog.tsx:72-78` and `change-line-sheet.tsx:56-59`, and the button of `features/shopping-sessions/trip-receipt-summary.tsx:170-178` (all should be `size='xl'`, 44px)
- **DS reference:** Core Components › Button (docs/design/design-system.html#c-button); Patterns › Sheets (`#p-sheets`); reference V4·17
- **Expected:** "Change Usual Store" = secondary (fill #E9ECF0, text #1D4ED8, hover #DEE2E8). Sheet footer buttons are 44px with 24px padding and a 16px label. Both buttons are full width inside the sheet.
- **Observed:** `outline` is a white button with a slate-200 border (see DS-014); `size='primary'` is `h-10` (40px) up to the `md` breakpoint, below the 44px minimum on the phone this sheet is made for. `button.tsx:79` documents `xl` (44px) as the size for "sheet and form footers".
- **Why it matters:** The reference shows a grey button; the code shows a bordered white one, and the touch target is under the 44px rule.
- **Fix guidance:** `Button variant='secondary' size='xl'` with a full-width layout class; pass `size='xl'` to `UploadTicketDialog` (it forwards button props). Do not touch the dialog's default size.
- **Acceptance criteria:**
  - [ ] "Change Usual Store" renders #E9ECF0 / #1D4ED8 and measures 44px high at 390px
  - [ ] The upload button measures 44px high at 390px
  - [ ] Focus ring unchanged
- **Depends on:** none
- **Evidence:** static source (class values; height not measured at runtime)
- **Visual:** report.html#ds-026
- **Status:** open

### DS-027 · Store rows are separate grey cards inside a second scroll area; the reference and the DS use one grouped panel with dividers · Medium
- **Type:** misaligned: pattern, accessibility
- **Where:** `item-store-prices-sheet.tsx:45-66` (container `max-h-[min(60vh,480px)] overflow-y-auto`, one `Card variant='stat' size='stat' tone='muted'` per store); run 3: the same nested scroller in `src/components/commons/searchable-choice-list/searchable-choice-list.tsx:89` (`max-h-72 overflow-y-auto`) inside the Change Line sheet
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets); reference V4·17
- **Expected:** One panel (`bg/panel` #F6F7F9, 16px radius) holding all rows. Each row has 10px × 12px padding, a 56px minimum height and a 1px `border/divider` (#EEF0F3) between rows. The group is a list (`ul` / `li`) so a screen reader announces "list, 3 items".
- **Observed:** every store is its own card (padding 16px, 24px from `md`), 8px apart, no dividers, `div`s with no list semantics. The wrapper adds an arbitrary-value height cap and its own `overflow-y-auto` inside `SheetDialog`'s `ScrollArea`, so on a phone a long list has two nested scrollers.
- **Why it matters:** Cards of 56–110px each make a 5-store list long; the grouped panel is shorter and reads as one comparison. Nested scrollers trap touch scrolling.
- **Fix guidance:** Remove the inner scroll container and the arbitrary value (the sheet already scrolls and shows a scroll hint). Use one muted `Card` as the panel (check `size` `flush` or `tight` for the padding, or add a size variant to `Card`; do not use `p-*` at the call site) with the rows as list items and the divider from `border/divider` (DS-009). Keep each row's `data-testid`.
- **Acceptance criteria:**
  - [ ] One panel, rows separated by 1px dividers, no gap between rows
  - [ ] No `max-h-[...]` and no `overflow-y-auto` in the file; a list of 8 stores scrolls once at 390px
  - [ ] The group is exposed as a list with one item per store
- **Depends on:** DS-009 (divider token; can use `border-border` until it exists)
- **Evidence:** static source
- **Visual:** report.html#ds-027
- **Status:** open

### DS-028 · Row content: store name at 12px (reference 14px), tags and quantity on separate lines, no "Last", "0 times" noise · Medium
- **Type:** misaligned: pattern
- **Where:** `src/components/features/base-lists/items/item-store-prices-sheet.tsx:46-65`; `src/components/commons/entity-label/entity-label.tsx:16-32` (used as the row title)
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets); Core Components › Badge (`#c-badge`); reference v2
- **Expected (reference v2):** Line 1: the store entity (a 16px violet store icon and the name in Inter 600 **14px**, `entity/store-text` #5B21B6; no box, no tile) with the tags "Cheapest" and "Usual" inline after it, wrapping under the name when there is no room. Line 2: "Last 21 Feb · 2 times" in Inter 12 `text/body` (#475569, 7.0:1 on the panel) with the count in 600. A store with no price: "No price yet" on line 2 (add "· N times" only when purchases exist) and "—" in the price slot. Right column: the price, then the delta (DS-029).
- **Observed:** the title is `EntityLabel`, fixed at a 14px icon and Inter 600 **12px** (no size option); line 2 is "21 Feb · 2 times" (no "Last", count not emphasised) in `text-slate-500` (4.44:1 on the panel, below AA); the tags are a third line; "2 each" is a fourth line; a store without a price shows "No price yet · 0 times".
- **Why it matters:** The store is the row's main content and it is drawn smaller than the tags next to it; the same data takes four lines where the reference uses two, and the grey meta fails AA.
- **Pending assumption:** the first reference (V4·18) drew a tile and an ink name; v2 draws the bare violet label. This issue follows v2 for every state.
- **Fix guidance:** Give `EntityLabel` a size variant (`md` = 16px icon, 14px name; the current size stays the default so its other uses do not change): appearance goes through the component's variant, not `className` at the call site. Tags in a `flex-wrap` line after the name; the name keeps `min-w-0` and truncates (full name stays in the DOM). Meta colour from `text/body` (DS-006 / DS-020 tokens); the count in `font-semibold`. Keep the quantity and per-unit price in the right column under the price, as today, because they explain how the cheapest store was chosen. The 14px store name is not in the DS yet (the store entity is a 12px chip role): part of the DS update (Open design decision 8).
- **Acceptance criteria:**
  - [ ] Row shows the 16px icon and 14px/600 violet name, inline tags, and "Last <date> · N times" with the count in 600
  - [ ] "No price yet" rows do not show "0 times"
  - [ ] A very long store name with two tags truncates the name and keeps the price visible at 360px
  - [ ] Meta text contrast ≥ 4.5:1 on the panel; the existing test for the long name still passes
- **Depends on:** DS-027
- **Evidence:** static source
- **Visual:** report.html#ds-028
- **Status:** open

### DS-029 · The price difference against the cheapest store is not shown · Medium
- **Type:** design improvement (from the reference)
- **Where:** `item-store-prices-sheet.tsx:61-63` (price column); `helpers/compare-store-prices.ts:3-7` (the result only carries `cheapestStoreId`, `comparableCount`, `notComparable`)
- **DS reference:** Core Components › Counters › Delta (docs/design/design-system.html#c-counters); reference v2 ("↑ $0.50" under $6.29)
- **Expected:** The DS Delta: mono 600/12, a 12px up arrow (`ArrowUp01Icon`), no box, red because a higher price is a bad change for this metric; direction is the arrow, never only the colour. Shown under the price of every comparable store that is not the cheapest. Text colour `feedback/error` #B91C1C (6.04:1 on the #F6F7F9 panel). The difference uses the same basis the cheapest was chosen on (per unit when a quantity exists: "↑ $0.25 / each"). The cheapest row and rows that can't be compared show none. The arrow is decorative; the text alternative says "$0.50 more than Costco".
- **Observed:** not built; the helper does not return per-store differences. (The DS defines Delta; its code mapping says "not implemented yet".)
- **Why it matters:** The sheet answers "where is it cheaper?"; the delta says by how much without mental arithmetic.
- **Fix guidance:** Extend `compareStorePrices` to also return, for the stores in the compared group, the difference to the cheapest unit price (rounded to cents, none when 0). Reuse the existing grouping rule. Render it in the right column. Add unit tests for the rule in the helper's test file: same unit and different quantities, a tie, a store in another unit (no delta), a single store (no delta).
- **Acceptance criteria:**
  - [ ] Non-cheapest comparable rows show the difference; cheapest and incomparable rows do not
  - [ ] The difference matches the basis used for "Cheapest" (verified with a 2 × $8.00 vs 1 × $4.49 case)
  - [ ] Text contrast ≥ 4.5:1 on the panel; screen-reader text names the cheaper store
  - [ ] Helper tests cover the four cases above
- **Depends on:** DS-028
- **Evidence:** static source
- **Visual:** report.html#ds-029
- **Status:** open

### DS-030 · Stat tiles use the grey variant without icons or units; the reference is a white tile with an icon, a 24px value and a small unit · Medium
- **Type:** misaligned: component (pending DS update)
- **Where:** `item-store-prices-sheet.tsx:38-42` (three `StatTile` with the default `muted` variant, no icon); `src/components/commons/stat-tile/stat-tile.tsx:19-25`; `src/components/ui/card.tsx:41` (`size === 'stat'`: `gap-3 p-4 md:p-6`). `Card size='stat'` is also used by `features/tickets/attach/change-line-sheet.tsx:38` and by the white `StatTile`s of `attach-to-session-dialog.tsx`: check them after changing the size.; run 3: the white tiles of the review sheet (`features/tickets/attach/attach-to-session-dialog.tsx:49-53`) use the same `Card size='stat'` and take the same 12px padding
- **DS reference:** Core Components › Counters and stat tile (docs/design/design-system.html#c-counters); reference v2
- **Expected (reference v2):** A white tile with a 1px hairline ring (the `white` variant of `StatTile`), **12px padding**. Top row: a 28px icon tile at the start (`RowIcon` size `stat`) and the value at the end in mono 600/24 with a small unit after it ("~9" + "d", "19" + "Feb", unit Inter 12/500 `text/muted`). Label below: Inter 12/600 `text/body` (7.6:1 on white). Icons: bag (`ShoppingBag02Icon`, the app's trip icon) "Times bought", clock (`Clock01Icon`) "Between trips", calendar (`Calendar03Icon`) "Last bought". Hues as drawn: blue, violet, green.
- **Observed:** the sheet uses the grey `muted` variant with no icon: value mono 20, label `text-slate-500` (4.44:1 on the grey panel, below AA), padding 16px (24px from `md`), the unit "d" and the month at the same size as the value. The `white` variant already provides the icon-and-value row, a 24px value and a semibold label, but it is not used here and has no unit option. A previous-year date renders "21 Feb 2025" (11 characters of 24px mono) and will not fit the tile (risk, unverified).
- **Why it matters:** The tiles are the first thing in the sheet and they are visibly different from the reference: no icons, grey instead of white, taller by 8–16px.
- **Fix guidance:** Use `StatTile variant='white'` with `icon` and `iconTone` for the three tiles; add a `unit` prop to `StatTile` (a smaller suffix after the value) as part of the component; set the padding of `Card size='stat'` to the DS 12px. For a date from another year show the day and month only. The label colour comes from DS-006 / DS-020. DS note: the DS stat tile is a grey panel and says "nest grey inside white"; the reference draws white tiles on a white sheet. This issue follows the reference; the DS-aligned alternative (grey tiles, one icon hue) is Open design decision 10.
- **Acceptance criteria:**
  - [ ] Three white tiles with icon, value with unit and label as in v2, padding 12px at 390px and at 1280px
  - [ ] "~9 d" and "19 Feb" render the unit smaller than the value
  - [ ] A previous-year date does not break the tile layout
  - [ ] `change-line-sheet.tsx` and the attach dialog counters checked visually after the padding change
- **Depends on:** DS-006 (label colour), DS-009
- **Evidence:** static source + computed contrast
- **Visual:** report.html#ds-030
- **Status:** open

### DS-031 · The section heading is sentence-case 14px ink; the reference uses the uppercase category caption · Low
- **Type:** misaligned: typography
- **Where:** `item-store-prices-sheet.tsx:43` (`h3 text-sm font-semibold` and a `p text-xs text-slate-500`); `src/components/commons/category-section/category-heading.tsx:47` (the same style, written inline)
- **DS reference:** Foundations › Typography › Category caption (docs/design/design-system.html#foundations); reference v2 ("LAST PRICE BY STORE")
- **Expected:** "LAST PRICE BY STORE" in the DS Category caption: Inter 600 12/1.25, +0.04em, uppercase, `text/secondary` (#334155; the reference looks a shade lighter, `text/body` #475569 also passes). "Only prices from your own receipts." below in Inter 12 `text/muted`. Keep it an `h3`. (The mono Overline of the DS is for real process stages; the reference does not use it.)
- **Observed:** Plus Jakarta 14px semibold in ink, sentence case. The category-caption style exists only inline in `category-heading.tsx`; other files hand-write uppercase labels (`nav-session-card.tsx:27`, `no-session-banner.tsx:64`, `change-line-sheet.tsx:40`, `card-footer-content.tsx:20`).
- **Why it matters:** A second place now needs the same label, which is the AGENTS threshold for extracting it.
- **Fix guidance:** Extract the style from `category-heading.tsx` into a shared section-label component in `components/commons/` (with a `testId` prop and a barrel update), use it in `CategoryHeading` and here. Migrating the four hand-written labels is outside this batch.
- **Acceptance criteria:**
  - [ ] The heading renders as the category caption and is still an `h3`
  - [ ] `CategoryHeading` renders unchanged using the shared component
  - [ ] The component has a `data-testid` via `testId`
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-031
- **Status:** open

### DS-032 · The one-store hint is plain grey text; the reference is an info callout with a different instruction · Low
- **Type:** misaligned: component
- **Where:** `item-store-prices-sheet.tsx:68`
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert); reference V4·18
- **Expected:** `Alert` `info` (16px radius, 32px icon tile, body only): "Buy it at another store and attach that receipt to compare prices." Shown after the list when exactly one store has history (DS-024).
- **Observed:** `p text-xs text-slate-500`: "Bought at one store so far. Prices from other stores show here once you buy it there." It describes the state; the reference tells the person what to do.
- **Fix guidance:** Same Alert usage as DS-025 (`role="status"`); copy from the reference.
- **Acceptance criteria:**
  - [ ] One-store state shows the info callout with the reference copy
  - [ ] The old paragraph is gone
- **Depends on:** DS-024, DS-025
- **Evidence:** static source
- **Visual:** report.html#ds-032
- **Status:** open

### DS-033 · Tag icons: "Cheapest" uses a circled check and "Usual" a pin; the reference uses a price tag and a repeat glyph · Low
- **Type:** misaligned: icon (pending DS update)
- **Where:** `item-store-prices-sheet.tsx:56` (`CheckmarkCircle02Icon`), `:57` (`Pin02Icon`)
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets: the DS specimen uses `Tick02Icon`); Foundations › Iconography (`#f-icons`: the pin means "manual store"); reference v2
- **Expected (reference v2):** "Cheapest" with a price-tag glyph (`Tag01Icon`) and "Usual" with the looping-arrows glyph (`RepeatIcon`), 13px, same tag. Both icons exist in `@hugeicons/core-free-icons`; confirm the exact glyphs against the design file.
- **Observed:** a circled check and a pin. The pin also contradicts the DS (it marks a store chosen by hand, but this tag is shown for automatic stores too).
- **Why it matters:** The same fact ("this is the usual store") should not use a pin here and a store icon in the list row; the reference settles the sheet's glyphs.
- **Fix guidance:** Swap the two icons. The usual-store chip of the list row (`base-list-item-row.tsx:60-71`, store or pin by source) is a different element (it names the store) and stays. Record the two glyphs in the DS iconography with the DS update (Open design decision 8).
- **Acceptance criteria:**
  - [ ] "Cheapest" shows the price-tag glyph and "Usual" the repeat glyph; the existing test still finds the text "Cheapest"
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-033
- **Status:** open

### DS-034 · Stores are listed alphabetically; the DS lists them cheapest first · Low
- **Type:** design improvement
- **Where:** `helpers/item-store-summary.ts:96` (`store_history` sorted by name; its only consumer is this sheet, `base-list-item-row.tsx:127`)
- **DS reference:** Patterns › Sheets (docs/design/design-system.html#p-sheets: stores ordered by price, a store without a price last)
- **Expected:** Stores with a comparable price first by ascending price (unit price when units match), then stores with a price in another unit by name, then stores without a price by name. V4·17 happens to match alphabetical order.
- **Observed:** alphabetical by name, so the cheapest store is wherever its name falls.
- **Why it matters:** The sheet exists to compare; with five stores the cheapest should not be in the middle.
- **Fix guidance:** Sort for display in the sheet (or in the helper, since nothing else reads it) after `compareStorePrices`. Add a Vitest case for the order rule.
- **Acceptance criteria:**
  - [ ] Cheapest comparable store is first; stores without a price are last
  - [ ] Order is stable for equal prices (by name)
  - [ ] Unit test covers the rule
- **Depends on:** DS-029 (same comparison basis)
- **Evidence:** static source
- **Visual:** report.html#ds-034
- **Status:** open

## Batch 5 — Trip receipt review, Change Line and trip detail (references V4·11, V4·12, V4·13, V4·15, V4·16)
Scope of the third run. The user supplied five reference screens (`assets/ref-v4-11-attach-review-all-cases.png`, `ref-v4-12-change-line.png`, `ref-v4-13-attach-review-all-match.png`, `ref-v4-15-trip-one-receipt.png`, `ref-v4-16-trip-receipt-per-store.png`). The code that draws them is `features/tickets/attach/` (review sheet and Change Line), `features/shopping-sessions/` (trip receipts card, items) and `app/(authenticated)/shopping/[runId]/page.tsx` (trip header).

**Result in one line:** the structure of all five screens is already built; what differs is glyphs, a few labels, the receipt rows of the trip card and the callout shape. The DS (v1.1.0) matches the code on most of these points, so the issues below are **references ahead of the DS** and are marked **(pending DS update)**; the recommended order is the same as Batch 4: run `/appds:update` once (Open design decision 8), then implement. Don't edit the DS from here.

Already aligned (no issue): the review sheet structure (title, intro, store entity, three white stat tiles with an icon and a value, six collapsible sections with a tile, caption, mono count and help line, grey panel rows with dividers, `Change` links, total paid, primary above secondary in the footer), the section captions and their order, the default folded state of "Not checked, not on the receipt", the tag shapes ("Remembered", "Linked by you", "No price", "No name" as amber attention tags), the strike-through price of left-out lines, the success callout "Everything you checked is on the receipt", the Change Line sheet (receipt-line card, three choice cards, selected card with the primary ring and blue fill, nested search field with a live count, radio rows with "checked / not checked" in mono, Save and Cancel), the trip header (back link, title, "Completed" pill, store entities, date line, amount in mono), the Paid card header ("Paid", mono total, items and stores, "Estimate was …"), the trip item rows (quantity chip, name, receipt price or "No price yet", note, store entity) and the tab bar with the cart on Trips.

### DS-035 · Review tiles use a double tick, a plus and a bare minus; the reference draws a circled check, a plus and a circled minus · Low
- **Type:** misaligned: icon (pending DS update)
- **Where:** `src/components/features/tickets/attach/attach-to-session-dialog.tsx:50` (`TickDouble02Icon`), `:52` (`MinusSignIcon`)
- **DS reference:** Patterns › State – Trip and receipt (docs/design/design-system.html#p-tripflow: Review summary uses `TickDouble02Icon`, `Add01Icon`, `MinusSignIcon`); references V4·11 and V4·13
- **Expected (references):** "Matched" `CheckmarkCircle02Icon` (green tile), "New to Pantry" `Add01Icon` (blue tile, unchanged), "Left out" `MinusSignCircleIcon` (grey tile).
- **Observed:** a double tick and a bare minus. The DS draws the same, so the DS is the older source here.
- **Why it matters:** The circled forms match the status glyphs used in the section headers and the callout (`CheckmarkCircle02Icon` already marks success elsewhere in the same sheet).
- **Fix guidance:** Swap the two icons; the tile hues stay. Tile padding is DS-030.
- **Acceptance criteria:**
  - [ ] The three tiles show circled check, plus and circled minus with the same tones as today
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-035
- **Status:** open

### DS-036 · Several review sections share the same icon and tone; the reference gives each its own · Medium
- **Type:** misaligned: icon and tone (pending DS update)
- **Where:** `src/components/features/tickets/attach/trip-review-section.tsx:38-45` (`icon` and `tone` by section id)
- **DS reference:** Patterns › List – Category section (docs/design/design-system.html#p-category); references V4·11 and V4·13
- **Expected (references):**

  | Section | Icon | Tile tone |
  |---|---|---|
  | New to <list> | `Add01Icon` | blue |
  | Will be checked off | `Tick02Icon` | blue |
  | Already checked | `TickDouble02Icon` | blue |
  | Left out | `MinusSignCircleIcon` | grey |
  | Checked, not on the receipt | `InformationCircleIcon` | grey |
  | Not checked, not on the receipt | `CircleIcon` | grey |
- **Observed:** "Will be checked off" and "Already checked" both use `TickDouble02Icon`; "Already checked" is the **green** tone (the reference is blue); "Left out" and both "not on the receipt" sections use the same bare `MinusSignIcon`.
- **Why it matters:** The six sections are told apart by caption only; three share one glyph and two share another, so a scanned list reads as repeats. Green here also competes with the success callout above it.
- **Fix guidance:** Map the glyph and tone per section as in the table (`tone` already accepts `primary` and `muted`). No new variant is needed.
- **Acceptance criteria:**
  - [ ] Each of the six sections shows the glyph and tone of the table
  - [ ] "Already checked" is no longer green
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-036
- **Status:** open

### DS-037 · "No price" and "No name" use the same warning triangle; the reference uses a coin and a question mark · Low
- **Type:** misaligned: icon (pending DS update)
- **Where:** `src/components/features/tickets/attach/trip-review-line-row.tsx:21` (`Alert02Icon` for both)
- **DS reference:** Core Components › Badge › Attention tag (docs/design/design-system.html#c-badge); references V4·11
- **Expected (references):** "No price" `DollarCircleIcon`, "No name" `HelpCircleIcon`; "Remembered" and "Linked by you" keep their clock and link glyphs. Same amber attention tag.
- **Observed:** a triangle for both attention tags. (The DS draws "No price" with the triangle: also older.)
- **Fix guidance:** Choose the glyph from the tag text; confirm the exact glyphs against the design file.
- **Acceptance criteria:**
  - [ ] "No price" shows the coin glyph and "No name" the question mark; both stay amber
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-037
- **Status:** open

### DS-038 · "Checked, not on the receipt" rows have no price slot; the reference shows a dash · Low
- **Type:** misaligned: pattern
- **Where:** `trip-review-section.tsx:59-71` (rows built from `items`: quantity chip and name only)
- **DS reference:** Patterns › List – Item row › Finished trip (docs/design/design-system.html#p-itemrow: "No price yet"); reference V4·11 ("Paper Towels 6 Rolls … —")
- **Expected:** The row keeps the right-hand price column: "—" in mono (`text/muted`) because these items stay as bought, without a price.
- **Observed:** no price column, so the name can run under where the other sections show a price.
- **Fix guidance:** Add the dash in the same column and type as the line rows; keep `min-h-14`.
- **Acceptance criteria:**
  - [ ] Rows of this section show "—" aligned with the prices of the sections above
- **Depends on:** DS-006 (dash colour)
- **Evidence:** static source
- **Visual:** report.html#ds-038
- **Status:** open

### DS-039 · The review intro says "this trip"; the reference says "the trip" · Low
- **Type:** copy
- **Where:** `src/components/features/tickets/attach/trip-review-copy.ts:2` (`intro`)
- **DS reference:** references V4·11 and V4·13: "Each receipt line updates the trip and your Pantry list. Nothing changes until you attach."
- **Expected:** "Each receipt line updates the trip and your <list> list. Nothing changes until you attach."
- **Observed:** "Each receipt line updates this trip and your <list> list. …"
- **Fix guidance:** Change the sentence and any test that asserts it (the copy is application-owned behaviour of the review: `tests/` of the attach module).
- **Acceptance criteria:**
  - [ ] The intro reads as in the references; tests updated
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-039
- **Status:** open

### DS-040 · Notices inside the review sheet are 24px status cards; the DS uses the 16px alert inside sheets · Medium
- **Type:** misaligned: component
- **Where:** `attach-to-session-dialog.tsx:54-56` (`StatusCard` for "The trip is still shopping" and "Everything you checked is on the receipt"), `:38-45` (load and submit errors); `src/components/commons/status-card.tsx:22` (`Card size='receipt'`: 24px radius, `p-4 md:p-6`)
- **DS reference:** Core Components › Alert and status card (docs/design/design-system.html#c-alert: "an alert reports something inside a card or a sheet; the status card is the same message at page level and takes the card radius"); references V4·11 and V4·13 (the callout reads at the 16px radius of the tiles; confirm in the design file)
- **Expected:** Inside a sheet: the info or success **Alert** (16px radius, 12px padding and gap, 32px icon tile in the tint, title 600/14 in the strong level, body 14/21 `text/body`). The status card stays for page-level states (trip receipt card).
- **Observed:** `StatusCard` in the sheet: 24px radius and 16px (24px from `md`) padding.
- **Why it matters:** The callout is the largest block of the all-match screen and reads heavier than the tiles it sits between.
- **Fix guidance:** Use `Alert` (`info` / `success` tones) with `AlertTitle` and `AlertDescription` and `role="status"`, as in DS-025. Alert tones are rebuilt in DS-016 (the `success` tone does not exist yet there: the plan DS-016 covers info, warning and error; add success with the same anatomy). Keep the error cards' actions.
- **Acceptance criteria:**
  - [ ] The two notices render as 16px alerts with icon tile, title and body
  - [ ] `StatusCard` is no longer used inside `SheetDialog`
- **Depends on:** DS-009, DS-016
- **Evidence:** static source
- **Visual:** report.html#ds-040
- **Status:** open

### DS-041 · Change Line shows the receipt text in Title Case; the DS and the reference show it as printed · Low
- **Type:** misaligned: content
- **Where:** `src/components/features/tickets/attach/change-line-sheet.tsx:42` (`formatItemName(line.name)`)
- **DS reference:** Patterns › Sheet – Change Line (docs/design/design-system.html#p-sheets: "SK SOUR PEG"); reference V4·12 ("SK SOUR PEG")
- **Expected:** The receipt-line card shows the text exactly as read from the receipt, in mono, so the person can compare it with the trip items below. (Title Case stays for item names everywhere else.)
- **Observed:** "Sk Sour Peg".
- **Fix guidance:** Render `line.name` unchanged in this card only. The size looks larger in the reference (about 16px against 14px); confirm in the design file before changing it.
- **Acceptance criteria:**
  - [ ] The card shows the raw receipt name; the review rows still show the Title Case name
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-041
- **Status:** open

### DS-042 · The trip header tag says "2 Receipt attached"; the reference says "2 receipts" with a receipt glyph · Medium
- **Type:** misaligned: copy and icon
- **Where:** `src/app/(authenticated)/shopping/[runId]/page.tsx:91` (`${receipts.length} Receipt attached`, `Attachment01Icon`)
- **DS reference:** Patterns › Header – Detail (docs/design/design-system.html#p-screenheader: "Receipt attached"); references V4·15 ("Receipt attached") and V4·16 ("2 receipts")
- **Expected:** One receipt: "Receipt attached"; several: "2 receipts" (count first, plural noun). Glyph: the receipt (`Invoice01Icon`) in both. No receipt: "No receipt" (DS) in the attention tag.
- **Observed:** "2 Receipt attached" (ungrammatical), a paperclip, and "No Receipt attached" for none.
- **Why it matters:** It is the first line of context on a finished trip and it reads as a bug.
- **Fix guidance:** Derive the label from the count; the empty case follows the DS wording "No receipt". Add or update a test for the three labels (behaviour of what is shown).
- **Acceptance criteria:**
  - [ ] 0, 1 and 2 receipts show "No receipt", "Receipt attached" and "2 receipts" with the receipt glyph
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-042
- **Status:** open

### DS-043 · Trip receipts card: a folding "Receipts" section with tags; the reference is one grey row per receipt with a thumbnail · Medium
- **Type:** misaligned: pattern (pending DS update)
- **Where:** `src/components/features/shopping-sessions/trip-receipt-summary.tsx:158-168` (`CategorySection` "Receipts", ocr tile, "N receipts" count), `:86-120` (rows: store, tag "Attached to trip", items and total, link), `:165` (`divide-y`)
- **DS reference:** Patterns › State – Trip and receipt (docs/design/design-system.html#p-tripflow: rows with `Invoice01Icon`, name, "Attached to trip" tag and amount); references V4·15 and V4·16
- **Expected (references):** Under the "Paid" header, no section header. Each receipt is its own grey panel (16px radius, 8px between panels, no dividers) with a 56px receipt tile at the start (white, 16px radius), the store name 600, "13 items · $86.40" with the count in 600, and "View Receipt ›" in the primary colour aligned to the end. The "Attached to trip" tag is gone (the header tag of DS-042 says it). The "Add Another Receipt" button follows (DS-044).
- **Observed:** a folding "Receipts 1 receipt" section with the cyan tile and caption, one panel with `divide-y`, the store name and the tag on the first line, the link on the second.
- **Why it matters:** The section header repeats what the card header ("13 items · 1 store") and the trip tag already say, and pushes the receipts down one row.
- **Fix guidance:** Remove the `CategorySection` wrapper in the completed mode and render one grey panel per receipt (a `Card` tone `muted`; no `p-*` at the call site). The 56px tile uses a static receipt glyph for now; photo thumbnails are Open design decision 21. Keep the status chip for receipts that are not attached yet (the active mode and the reading / failed states).
- **Acceptance criteria:**
  - [ ] A completed trip with one or two receipts shows one panel per receipt with the tile, store, items and total, and "View Receipt"
  - [ ] No "Receipts" caption and no "Attached to trip" tag on attached receipts; pending receipts keep their status chip
  - [ ] The existing tests of the receipt list pass or are updated for the new structure
- **Depends on:** DS-042, DS-044
- **Evidence:** static source
- **Visual:** report.html#ds-043
- **Status:** open

### DS-044 · The button under the receipts says "Attach Receipt"; the DS and the reference say "Add Another Receipt" · Low
- **Type:** copy
- **Where:** `trip-receipt-summary.tsx:170-178` (`UploadTicketDialog label='Attach Receipt'`, `Attachment01Icon`)
- **DS reference:** Patterns › State – Trip and receipt (docs/design/design-system.html#p-tripflow: "Add Another Receipt"); references V4·15 and V4·16
- **Expected:** "Add Another Receipt", secondary, full width, 44px (DS-026).
- **Observed:** "Attach Receipt" with a paperclip. The app now has seven labels for adding a receipt (see Open design decision 15).
- **Fix guidance:** Pass the label; keep the icon unless the design file says otherwise.
- **Acceptance criteria:**
  - [ ] The completed trip card shows "Add Another Receipt"
- **Depends on:** DS-026
- **Evidence:** static source
- **Visual:** report.html#ds-044
- **Status:** open

### DS-045 · "also at Costco" is lowercase in trip item rows; the reference capitalises it · Low
- **Type:** copy
- **Where:** `shopping-session-item-row.tsx:44` (`formatAlsoAt` output rendered as is); `helpers/item-store-summary.ts:104-110` (`formatAlsoAt`, shared with the list rows)
- **DS reference:** references V4·15 and V4·16 ("No Frills  Also at Costco"); Patterns › List – Item row (docs/design/design-system.html#p-itemrow: lists keep "· also at Costco" lowercase after the dot)
- **Expected:** In a trip row the store entity and "Also at Costco" are two elements separated by space (no dot), so the second starts with a capital. List rows keep the lowercase form after the dot.
- **Observed:** "also at Costco" in the trip row.
- **Fix guidance:** Capitalise at the trip row (not inside `formatAlsoAt`, which the list rows use). Test the string where the helper is tested.
- **Acceptance criteria:**
  - [ ] Trip rows show "Also at Costco"; list rows are unchanged
- **Depends on:** none
- **Evidence:** static source
- **Visual:** report.html#ds-045
- **Status:** open

## Pending assumptions
Choices made without the user's full confirmation. The issues that follow them say so; they are implementable, and if the owner reverses one, the DS and this plan are updated first.
- **Dark mode uses the navy values** from the old spec (§3.4), derived and contrast-checked in the DS but never reviewed in the running app (DS-010).
- **One 20px checkbox size** with a 44px target, resolving a conflict inside the old spec (DS-019).
- **Muted text #5B6B82** (user-confirmed) and **faint #94A3B8 restricted to decoration** (DS-006, DS-020).
- **Alert radius 16px**, from the old HTML reference (the written spec said 22px, off the radius scale) (DS-016). **Toast** follows the reference's dark inverse toast (DS-023).
- **Disabled opacity 50%**, matching what the code already ships (no issue: aligned).
- **Single violet hue with two named roles** (store entity and collaboration), user-confirmed; no code change.
- **The reference V4·17–19 supersedes the DS v1.1.0 "Prices by Store" specimen**, which is older (Batch 4). The DS has not been updated yet; run `/appds:update` first (Open design decision 8).
- **The updated reference v2 wins over V4·17**; V4·18 and V4·19 (not redrawn) keep their content and take the v2 look: bare violet store label, white icon tiles, the tag glyphs (DS-028, DS-030, DS-033).
- **The references V4·11 to V4·16 supersede the DS v1.1.0 "State – Trip and receipt" pattern** where they differ (glyphs, receipt rows, callouts, copy). The DS has not been updated (Open design decision 8). Where a reference contradicts itself or the DS and it matters, it is an open decision (18 to 23) and nothing is implemented.
- **The Prices by Store sheet keeps its item name under the title in the code**; v2 does not show one (the crop starts below the title). Not changed by this plan (Open design decision 17).

## Informational — DS entries added from code
None. No component, variant or state found in code was added to the DS in either run. Run 2 found the opposite case: the user-supplied reference is ahead of the DS (Batch 4 note and Open design decision 8); that is a DS update to run with `/appds:update`, not a code task. Code-only variants that were judged not to earn a place yet are listed under Open design decisions.

## Unverified — needs runtime testing
Nothing below was executed: the repository was read, not run.
- Keyboard navigation and focus order of dialogs, sheets, menus, the category sections and the tab bar: tab through each with the keyboard only.
- Screen-reader output (names of icon-only buttons such as "More options for <name>", checkbox names "Include <name>", progress values): test with VoiceOver or NVDA on a trip and a receipt review.
- Rendered appearance of the components not read in this audit: `ui/dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx`, `dropdown-menu.tsx`, `progress.tsx`, `avatar.tsx`, `sidebar.tsx`, `select.tsx`, `toast.tsx`, `tooltip.tsx`, `skeleton.tsx`, `app/mobile-tab-bar.tsx`. Compare each with the DS in Chrome DevTools at 390px and 1280px; the next audit can then classify them.
- Dark-mode rendering of every screen (DS-010).
- Touch-target sizes at runtime (the 44px rule and the documented compact exceptions): measure in DevTools.
- Field boundary contrast (see Open design decisions): measure `shadow-field` ring against the canvas in the browser.
- Prices by Store (run 2, nothing was run): open the sheet from a list item with (a) three stores, (b) one store, (c) a usual store and no receipts, (d) no store at all, at 390px and 1280px in light and dark. Check: the DS-024 state selection, 44px footer buttons, two tags plus a 40-character store name, a previous-year date in the "Last bought" tile ("21 Feb 2025"), a list of 8 stores (one scrollbar), focus order and focus return to the row menu, and the screen-reader reading of a row (store, date, tags, price, difference).
- Trip review, Change Line and trip detail (run 3, nothing was run): open the review for a trip with all six sections, with everything matching, with a duplicate-store error and while the trip is still active; Change Line with a long list of trip items (one scrollbar); a trip with 0, 1 and 2 receipts (header tag, receipt panels); keyboard order inside the folding sections and the radio group; the reading of a section header by a screen reader (caption, count, expanded state). Check light and dark at 390px and 1280px.
- Reference sizes read from the PNGs are **not** claimed in this batch beyond what is visible (shape, glyph, order, label): the font sizes of the store entity and of the receipt-line card in V4·12 could not be measured reliably; confirm them in the design file.
- Reference details that cannot be read from the PNGs: the exact text colour of the grey "Change Usual Store" button (it is not in v2; the plan keeps the DS secondary #1D4ED8), the exact Hugeicons glyphs of the two tags and of the calendar, and the exact icon-tile hues (read as blue-100/violet-100/green-100 with the 700 icons). Confirm in the design file.

## Open design decisions
Not to be implemented until the owner answers.
1. **Old reference files (needed to finish Batch 0).** Delete `docs/design/DESIGN.md` and `docs/design/listys-design-system.html`, delete only one, or keep both as historical references? *Recommendation:* delete both once DS-001 to DS-004 are done, because the DS replaces them and `CHANGELOG.md` keeps the history. Keeping them invites two sources of truth.
2. **Field boundary contrast (WCAG 1.4.11).** The elevated field's ring (`--shadow-field`, 10% ink) is about 1.2:1 against the canvas. The label, placeholder and focus ring identify the field. *Recommendation:* keep the soft look, review it in usability testing, and strengthen the rest ring only if people miss fields.
3. **Code-only button sizes.** `touch`, `mobile-action`, `sm-default`, `quiet-touch`, `link-action`, `hero-action`, `block`, `avatar` exist in `button.tsx` beside the DS scale (xs/sm/md/lg/xl/2xl and the responsive "primary" role). *Recommendation:* map each to a DS size in a later `/appds:update` instead of adding eight sizes to the DS.
4. **Code-only badge variants.** `merged` (used for "Confirm match" in `ticket-item-row.tsx:27`) and `category` use a `primary/10` tint with no DS definition. *Recommendation:* give "Confirm match" the DS info tag (blue-50 fill, blue-100 ring, icon) and drop `category` if unused.
5. **Wordmark and phone-header type sizes.** `features/auth/auth-screen.tsx:8` uses `text-[22px]` and the old spec uses a 19px wordmark; both are outside the closed type scale (12/14/16/18/20/24/30/36). *Recommendation:* 20px (`text-xl`) for the wordmark.
6. **Receipt status vocabulary.** The old spec lists "Ready" and "Processed" for the same state and the code ships "Processing", "Ready for Review", "Reading Receipt". Colors are fixed by DS-015; the labels need a copy decision.
7. **Landing page scope.** The landing page uses a white ground, 6px radius and mock-up internals with their own sizes (e.g. 39 `text-[Npx]` uses of 8–30px and 5 arbitrary hex values in 4 files, all in `components/marketing/`). The DS excludes it. Confirm, or ask for a marketing section in the DS.

8. **Absorb the reference into the DS before Batch 4.** DS v1.1.0 shows an older Prices by Store. *Recommendation:* run `/appds:update` once to add: the white stat tile with an icon, a 24px value and a unit suffix; the 14px store entity (`EntityLabel` size `md`); the category caption inside sheets; grouped store rows with inline tags and the Delta under the price; the tag glyphs (price tag, repeat) in the iconography; info callouts for the one-store and empty states; full-width footer buttons; the label "Cheapest" (the specimen says "Lowest on last receipts") and the date "21 Feb" (the specimen says "Feb 19"). Run 3 adds: the circled glyphs of the review tiles, the six section icons, the coin and question-mark attention tags, the 16px alert inside sheets, the receipt row with a 56px tile and no "Receipts" caption, "Add Another Receipt", the label "2 receipts", the raw receipt text in Change Line, and the "Trips = cart" rule of decision 22. Then implement Batches 4 and 5.
9. **Store row identity.** *Resolved by reference v2:* bare violet icon and violet name at 14px, in every state. The DS needs the 14px size (decision 8).
10. **Stat tiles: fill and icon hues (suggestion).** The reference draws white tiles with blue, violet and green icons. The DS says "nest grey inside white" (a stat tile is a grey #F6F7F9 panel) and keeps violet for the store and collaboration roles and green for success. *Recommendation:* grey tiles with one icon hue (primary blue), which also matches the grey store panel below. The plan follows the reference; the report shows both with a switch.
11. **Icon of the "Usual" tag.** *Resolved by reference v2:* the repeat glyph (DS-033). The list-row chip keeps the store / pin icon because it is a different element.
12. **Usual-store line and "Added by hand" tag inside the sheet.** The code shows them at the top of the sheet; the reference shows them in the item header behind the sheet (the reference background is an item screen that this app does not have: the sheet opens from a list row). *Recommendation:* drop the top line when store rows exist (the "Usual" tag says it) and keep "set by you / automatic" in the tag's accessible name; keep "Added by hand" in the empty state only until an item screen shows it. Not implemented in Batch 4.
13. **"Change Usual Store" with one store.** V4·18 hides the button; the code shows it whenever the item has a handler. *Recommendation:* hide it only if the store picker offers just stores with purchase history; if the picker lists all the user's stores, keep it. Check `features/stores/store-picker-dialog.tsx` first.
14. **Colour of the price difference.** *Resolved:* the DS Delta already says red for a bad change and the reference uses red; DS-029 follows it with #B91C1C.
15. **One label for "upload a receipt".** The app uses Upload Receipt, Upload a Receipt, Upload New Receipt, Upload a New Receipt and Upload Another Receipt. *Recommendation:* use the reference label "Upload New Receipt" in this sheet (DS-025) and decide the app-wide wording separately. Run 3 adds "Attach Receipt" (completed trip card, DS-044 changes it to "Add Another Receipt") and "Add Another Receipt", so the app has seven wordings for one action.
16. **Font of the meta line (suggestion).** The reference draws "Last 21 Feb · 2 times" in the sans face with the count in semibold; the DS Receipt meta role is mono 500/12 for dates and counts under titles. *Recommendation:* mono, as the DS says, if you want the sheet to read like the rest of the data lines; the plan follows the reference (DS-028). Shown in the report switch.
17. **Item name under the title (suggestion).** v2 shows no item name; the code shows it as the sheet description, and the sheet opens from a list row where the name is not visible. *Recommendation:* keep it (as the DS specimen does). Shown in the report switch.
18. **Chevron of the folding sections.** The references V4·11, V4·13 and V4·16 draw up when a section is open and down when it is closed; V4·15 draws down on open sections; the DS and the code draw down when open and right when closed. *Recommendation:* up when open, down when closed (three references agree, and it is the common accordion convention); redraw V4·15. Not implemented until you choose.
19. **"Collapse All / Expand All" in the review sheet.** The DS documents it and the code renders it above the sections; V4·11 and V4·13 show none. *Recommendation:* keep it (six sections can be long); confirm whether its omission in the references was deliberate.
20. **"Delete receipt" at the bottom of the review sheet.** The code renders it under the footer buttons; the references end with Cancel. *Recommendation:* keep it until the receipt screen offers the same action with its own confirmation and Undo; then remove it from the sheet. Not changed by Batch 5.
21. **Source of the 56px receipt tile (DS-043).** A thumbnail of the first photo (needs a signed URL, a loading state and a fallback) or a static receipt glyph. *Recommendation:* the static glyph first; thumbnails as a separate change.
22. **Icon of the Trips tab (DS-022 withdrawn).** The code and references V4·15 and V4·16 use the shopping cart on the Trips tab; the DS iconography reserves the cart for "Start Shopping" and gives the trip the bag. *Resolved by the references:* the cart stays in the navigation; the DS rule becomes "the cart is the Trips destination and the Start Shopping action; the bag is the trip on its own cards" (part of decision 8).
23. **Date line of a finished trip.** V4·16 and the code show "Sat 7 Feb · 18:40 · $127.52"; V4·15 shows "Sat 7 Feb · $86.40"; the DS shows "Feb 19, 2026 · 17 items · $62.40". *Recommendation:* weekday, day and month, time, amount (V4·16 and the code); update the DS.
