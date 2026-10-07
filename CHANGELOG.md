# Changelog

## Unreleased

- Redesign the dashboard (mobile first): greeting, an active-session or next-trip hero, an "Up next" list derived from real
  receipts, lists and trips, and the three section cards (groups with their nested lists, receipts, history) with aligned
  footers. Phones get a fixed bar to continue the running trip.
- Replace the mobile dropdown menu with a side-sheet drawer and a three-part top bar; the active navigation item is now a soft
  blue fill (as specified in `docs/design/DESIGN.md`) in both the sidebar and the drawer.
- Use the specified action blue (`#2563EB` light, `#60A5FA` dark with ink text) for `--primary`, `--ring` and the sidebar
  equivalents instead of the lighter `#3B82F6`, and document the exact OKLCH values in `docs/design/DESIGN.md`.
- Share one highlight layer across every primary button (`PRIMARY_BUTTON_LAYER` in `ui/button.tsx`): the app `Button`, the
  marketing `ButtonLink`, and the mobile session bar's "Continue" pill. The layer is now always white.
- Dashboard card actions and quick-start chips are small on phones and regular from `md` up.
- Page gutters are 16px on phones, 24px on tablets and 32px on desktop, and the page header band now uses the same gutters
  as the content below it.
- Restyle the running-session badge (static dot instead of a perpetual pulse, readable green, an `on-dark` tone for the
  dashboard banner) and size every `Badge` to the specified 24px height and 600 weight.
- Align the dashboard with the approved A1 design: 24px card and hero radii, 12px controls, blue outline in-card actions,
  inset slate dividers and blue hover borders on cards, 50px hero call to action with glow, folder tiles on group rows and the
  amber date pill.
- Make the `outline` (secondary) `Button` variant neutral with a blue glyph: paper, ink text, flat slate-200 border. Every
  secondary button in the app inherits it, including the dashboard's Upload Receipt, Start Shopping and Install app.
- Dashboard cards: soft shadow and lighter border, 20px radius on phones, hero shadow, "View all" right-aligned, no Upload in
  the Receipts footer, and centred, equal-height empty states with the first step ("New Group" / "Upload Receipt") under the copy.
- `CreateGroupDialog` accepts optional `variant` and `className` for its trigger.
- `GET /api/v1/base-lists` now also returns `items` (a count of each list's items). Additive; existing fields are unchanged.
- Initialize documentation system and add PRD, ADR template, runbooks, and contributing guide.
