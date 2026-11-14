# Confirmed component mappings

Source reviewed against the installed radix-maia components and the official shadcn MCP registry on 2026-11-13. This table resolves the audit's visual suggestions into implementation decisions.

| Pattern | Decision | Primitive |
| --- | --- | --- |
| StatusCard, RetryableError | Replace generic notice markup; keep contextual roles, IDs and actions | Alert |
| EmptyStateCard, DashboardEmptyState, TicketsEmptyState, TicketNoItems | Share the empty-state anatomy, retain feature content/actions | Empty; Card for standalone surface |
| FormField, EntityEditCard, StoreRenameCard | Preserve validation and submitted values; replace generic structure | Field; Card |
| ConfirmSheet | Retain mobile sheet as user-approved shared extension | AlertDialog |
| SheetDialog | Retain responsive wrapper and focus policy | Dialog, ScrollArea |
| RowMenu, ActionLink, ButtonLink | Already library compositions; retain contextual wrappers | DropdownMenu, Button |
| CategorySection, CategoryCollapseControl | Already library compositions; retain category state and expansion behavior | Collapsible, Button |
| SearchableChoiceList, ChoiceRow | Retain inline radio selection inside modal, avoiding a nested popup; use Field anatomy for choices | Input, RadioGroup, Field |
| HistoryListFilter, UsualStoreFilter | Already use searchable selection; retain route updates and current changes in the working tree | Combobox |
| AppBreadcrumb | Replace generic breadcrumb markup | Breadcrumb |
| AppSidebar, NavGroup | Already use the library sidebar and its menu parts; retain route and mobile-close behavior | Sidebar |
| NavCountPill, ItemQuantityChip | Replace generic tag markup | Badge |
| TicketStatusChip, ActiveShoppingBadge, NoStoreBadge | Already use Badge; retain existing state vocabulary and approved theme variants | Badge |
| EntityCard, BaseListCard | Keep domain props/menu/footer; replace generic outer surface | Card |
| TicketItemsCard, TicketAttachCard, TicketPhotoPanel, attached receipt state | Keep feature behavior and photo controls; replace generic outer surfaces | Card and its header/content parts |
| ReceiptAddedToListNote | Keep the domain explanation and note role | Alert |
| DashboardRow, receipt and list content rows | Use Item where the row displays content/actions | Item |
| ShoppingSessionItemRow | Row contains a checkbox: preserve label association and form-field semantics inside the native row surface | Item, Field |
| StatTile, card-based feature sections | Already compose Card; retain app-specific values and layout | Card |
| EntityCardSkeleton, DashboardSkeleton, BaseListsSkeleton | Already compose Skeleton; retain placeholder shape | Skeleton |
| MobileTabBar, RowIcon, EntityLabel, InlineCounter, DataLine, DetailsList, ListToolbar | Keep custom: no exact semantic primitive; not duplicate controls | Existing compositions |
| Auth, list/store/session/receipt/sharing flows, dashboard orchestration, marketing screens | Keep domain components; migrate shared primitives through their existing consuming wrappers | Existing compositions |

## Registry integration

Empty, Item and Breadcrumb fill actual gaps in the local UI folder. Official radix-maia registry sources are used with the project's existing cn utility and Hugeicons imports. No new dependency is needed. The CLI attempted to install the registry's cn dependency and stopped on unrelated pending build scripts; the added dependency was removed, and the documented manual-source installation path was used instead. No pending package build script was approved or run.

## Design adaptation

Native spacing and typography are accepted where shadcn has no matching size prop. Existing theme tokens and app-owned entity icon tiles preserve the current visual identity. New appearance variants are limited to the explicitly approved mobile confirmation sheet.
