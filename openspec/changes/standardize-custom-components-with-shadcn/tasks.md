# Tasks

## 1. Confirm equivalences and migration boundaries

- [x] 1.1 Recheck each mapped component in the source and label it direct primitive replacement, app wrapper to retain, or domain composition to keep; verify the resulting list matches `proposal.md` and `design.md`.
- [x] 1.2 Compare any missing candidate primitive such as `Empty` or `Item` with the official shadcn registry and the installed `radix-maia` setup; record whether to add it or compose from installed primitives, with the decision verified against the Design System.

## 2. Standardize notices, empty states, and fields

- [x] 2.1 Align `StatusCard` and retry/error presentations with the shared `Alert` primitive while preserving status roles, live announcements, actions, and existing tone variants; verify affected component tests and the Design System gate.
- [x] 2.2 Align shared empty states (`EmptyStateCard`, dashboard empty state, and ticket empty states) with the selected shadcn composition while preserving each screen's action and sizing contract; verify feature tests and the Design System gate.
- [x] 2.3 Align `FormField` and `EntityEditCard` field structure with `Field`/`Form` primitives without changing validation or error announcements; verify form-related tests and the Design System gate.

## 3. Standardize dialogs and selection patterns

- [x] 3.1 Align confirmation flows such as `ConfirmSheet` with `AlertDialog` semantics and the existing sheet presentation; verify cancel/confirm, loading, and destructive-action tests plus the Design System gate.
- [x] 3.2 Review `SheetDialog`, `RowMenu`, and `CategorySection`; retain wrappers that already compose `Dialog`, `DropdownMenu`, and `Collapsible`, and adjust only any duplicated primitive markup found; verify dialog/menu/expansion behavior tests and the Design System gate.
- [x] 3.3 Align searchable choices and history filters with `Combobox`, `RadioGroup`, `Select`, or `ToggleGroup` where each interaction model fits; preserve modal focus behavior and verify selection/filter tests and the Design System gate.

## 4. Standardize navigation, tags, cards, and rows

- [x] 4.1 Align route breadcrumbs and sidebar navigation with `Breadcrumb` and `Sidebar` primitives while preserving route-active logic and responsive behavior; verify navigation tests and the Design System gate.
- [x] 4.2 Align status/count labels with `Badge` or `SidebarMenuBadge` where their semantics fit; keep `EntityLabel` and non-status inline counters custom unless a matching primitive is semantically correct; verify affected component tests and the Design System gate.
- [x] 4.3 Align generic card and row shells (`EntityCard`, `BaseListCard`, dashboard/session/ticket rows) with `Card` and `Item` composition without moving feature logic into shared primitives; verify affected feature tests and the Design System gate.

## 5. Validate the migration

- [x] 5.1 Run the corresponding tests for every modified app-owned component/feature and `pnpm check:native-props`; verify all pass without adding appearance assertions.
- [x] 5.2 Start the app and inspect affected screens at mobile and desktop viewports, including DOM, computed styles, dimensions, focus, and relevant states; verify discrepancies are fixed and capture the required screenshots.
- [x] 5.3 Review the final diff and confirm no API, data, route, business-rule, or copy changes slipped into the UI refactor; verify the Design System gate passes for the complete changed-file set.
