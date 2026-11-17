# Design

## Context

See `proposal.md` for motivation and scope. The application already owns a `radix-maia` shadcn setup under `src/components/ui/`. The audit found that many shared components are already wrappers around those primitives; others compose app-specific behavior using hand-built markup. The Design System in `docs/design/design-system.html` remains the visual source of truth, and `AGENTS.md` requires its gate and visual checks for UI changes.

## Goals / Non-Goals

**Goals:**

- Make the generic UI primitive used by each audited pattern explicit and consistent.
- Reuse installed shadcn primitives and variants while preserving Listys wrappers that carry domain meaning, accessible names, focus management, test IDs, or responsive behavior.
- Make the migration incremental so each pattern can be reviewed against the existing Design System and behavior.

**Non-Goals:**

- Replacing domain flows such as auth, list management, shopping sessions, receipt review, sharing, or dashboard sections with generic shadcn components.
- Changing copy, routes, API contracts, business rules, persisted data, theme tokens, or the visual language defined by the Design System.
- Installing new dependencies or adding a primitive without a concrete gap in the existing `src/components/ui/` layer.

## Decisions

0. **User decision (2026-11-13): native shadcn APIs are the default.** Preserve as much of the current design as possible through existing shadcn variants and composition. Small visual differences needed to use those variants are accepted. Do not add a custom appearance variant or extension to reproduce an unsupported detail without first showing the specific limitation and asking the user to decide. The user explicitly approved retaining the responsive confirmation bottom sheet as a shared AlertDialog extension; desktop remains centered.

1. **Treat shadcn primitives as building blocks, not replacements for app flows.** `EntityCard`, `TicketReview`, and similar components remain app-owned compositions. Their generic surfaces and rows should use `Card` and `Item` where those components fit. This preserves domain logic and design intent while reducing bespoke primitive markup. The alternative of replacing those components wholesale would lose their domain behavior and props.

2. **Keep wrappers that already provide app-wide behavior.** `RowMenu` over `DropdownMenu`, `ActionLink` over `Button`, and `SheetDialog` over `Dialog` are useful wrappers, not duplicate primitives. Review their internal implementation for conformance, but do not remove them merely to call shadcn at every use site. `SheetDialog` retains its phone-sheet/desktop-dialog behavior and focus handling.

3. **Prefer the closest installed primitive, then confirm upstream availability before adding anything.** Use `Alert` for notices, `AlertDialog` for destructive/explicit confirmation, `Field`/`Form` for field structure, `Badge` for status/count tags, `Breadcrumb` for route hierarchy, and `Sidebar` for app navigation. Use `Collapsible` or `Accordion` for expandable sections and `Combobox` for searchable selection only where its popup model works inside the containing surface. If a candidate such as `Empty` or `Item` is not installed, compare it with the existing Maia design and composition before deciding whether to add it; do not introduce dependencies as part of this refactor.

4. **Preserve meaningful semantics when no equivalent exists.** Keep the bottom mobile tab bar, entity labels, non-status inline counters, icon tiles, and label/value definition lists app-owned unless an exact semantic fit is found. A visually similar `Badge` or `Avatar` is not a substitute when it changes the meaning exposed to users or assistive technology.

5. **Migrate by pattern and validate each affected feature.** Group changes by primitive family and update all instances in a family together. For changed app-owned components, run their relevant tests, native-props check where applicable, Design System gate, and the required mobile/desktop visual inspection. Avoid appearance assertions in tests.

## Risks / Trade-offs

- [A shadcn primitive's default structure may conflict with Maia variants or sizing] → Use existing project variants and theme tokens; add a shared variant only when the Design System supports it, and verify rendered screens.
- [A primitive can alter keyboard, focus, or announcement behavior] → Preserve current accessible contracts and cover app-owned behavior at the wrapper/feature boundary.
- [The audit mapped some components by visual role rather than an exact semantic match] → Keep those components custom unless code inspection confirms the primitive fits; record the decision in the implementation review.
- [A broad migration could create a large review surface] → Deliver small primitive-family batches and keep unrelated feature logic out of each batch.

## Migration Plan

1. Confirm each audited candidate against its current implementation and the installed `src/components/ui/` primitives; record whether it is a direct replacement, a wrapper to retain, or a domain component to keep.
2. Migrate shared generic patterns first: alerts and empty states, form fields, confirmation and breadcrumb patterns, then badges, rows/cards, and navigation/filter controls.
3. Update all usages in each selected family and preserve public props where practical; remove superseded markup only after every usage has moved.
4. Run the checks and visual validation required by `AGENTS.md` for each affected feature. No data migration or rollback procedure is needed because the change does not alter persisted or server contracts.

## Open Questions

None. The concrete primitive for each audited component can be confirmed against its implementation during the first migration task without changing the approach or scope.
