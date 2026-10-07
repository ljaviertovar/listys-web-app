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
  inset slate dividers and blue hover borders on cards, 50px hero call to action with glow and folder tiles on group rows.
- Make the `outline` (secondary) `Button` variant neutral with a blue glyph: paper, ink text, flat slate-200 border. Every
  secondary button in the app inherits it, including the dashboard's Upload Receipt, Start Shopping and Install app.
- Dashboard cards: soft shadow and lighter border, 20px radius on phones, hero shadow, "View all" right-aligned, no Upload in
  the Receipts footer, and centred, equal-height empty states with the first step ("New Group" / "Upload Receipt") under the copy.
- Dashboard follow-up from the critique: the hero's blue button now starts the most overdue list (or uploads a receipt for an
  account without lists) and the other lists are 44px "Your lists" shortcuts; the phone session bar only appears once the
  hero's button scrolls away; the header Upload is hidden while the hero already is the upload, and the Receipts card no
  longer repeats it; the date is plain muted text instead of an amber pill and the filler subtitle is gone; section cards
  have real `h2` titles, drop their description and show two rows on phones; finished receipts are plain text, not badges;
  a brand-new account sees a "How it works" card instead of three empty cards.
- Dashboard without data goes back to design A1: the hero asks for a receipt, the three cards show their empty states
  ("New Group" and "Upload Receipt" inside them), the header Upload is hidden while the account has no lists (the hero already is the upload), and the greeting is the date pill with its line of
  context again (now in the visitor's locale). This replaces the "How it works" card of the previous entry.
- Dashboard: a failed request now shows an error with "Try again" instead of an empty account; the loading skeleton mirrors the
  real layout; both heroes share `HeroSurface` and load the photo through `next/image`; card and hero shadows are the
  `shadow-card` / `shadow-card-hover` tokens; every "Start Shopping" button names its list for screen readers and list links fill
  their row; the phone session bar adds the safe-area inset to the page's bottom space.
- Mobile menu follows the approved reference: uppercase section labels, count pills on Shopping List Groups (neutral) and
  Receipts (amber, receipts still waiting for a list), the running session as a card with "Shopping now", `done/total` and a
  progress bar, the signed-in account with a 44px sign-out button, the author credit, 24px right corners, a long soft shadow
  and an ink scrim at 45%. The counts, progress and account load when the menu opens. `SheetContent` accepts `overlayClassName`
  and `AppSidebarFooter` accepts `className`.
- Desktop shell follows design A1: sidebar entries are 44px with a quiet hover and a blue marker on the current page, small
  uppercase section labels, count pills on Shopping List Groups and Receipts, and the running session card above the author
  credit; the top bar gains a "Section › Page" breadcrumb, a ghost "Install app" button and an account pill with the avatar,
  name and email (the same pill is avatar-only on phones, now with initials instead of the placeholder image). The sidebar is
  272px wide (`--sidebar-width` 17rem), as `DESIGN.md` specifies. The session card, counts and account summary are shared with
  the mobile menu (`useNavSummary`, `NavSessionCard`, `NavCountPill`).
- Accessibility: pinch-zoom is no longer disabled (`maximum-scale` and `user-scalable` removed), the mobile drawer has a 44px
  close button, a 312px width and a 44px author-credit link, and `<main>` has `scroll-padding-bottom` so focus is not hidden
  behind fixed bottom bars. `StartShoppingDialog` accepts an optional `size`.
- `CreateGroupDialog` accepts optional `variant` and `className` for its trigger.
- `GET /api/v1/base-lists` now also returns `items` (a count of each list's items). Additive; existing fields are unchanged.
- Initialize documentation system and add PRD, ADR template, runbooks, and contributing guide.
