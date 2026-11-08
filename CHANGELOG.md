# Changelog

## [Unreleased]

### Changed
- API rules moved into the `nextjs-saas-rest-api` skill. `AGENTS.md` no longer carries the ~110-line API Policy (versioning, URL and status-code rules, DTOs and envelopes, pagination, idempotency, CORS, observability, API tests); it keeps the Route Handler default, the versioned path, the Server Action boundary, a short always-on baseline (server-side auth and RLS, Zod at the boundary, explicit fields, safe errors) and the instruction to load the skill only when creating, changing, reviewing or auditing an endpoint, webhook or data-saving Server Action. The skill is copied into `.agents/skills/` and `.claude/skills/`; `docs/tooling-delegation.md` has its trigger row and says it is not in `skills-lock.json`. Rules the old text made mandatory for every endpoint (pagination metadata, rate limits, idempotency keys, OpenAPI, CORS allowlist) now apply only when the endpoint needs them. No code change.
- Alignment with the Listys V3 boards (F1–F6), first package: a phone no longer logs a hydration mismatch from the Install App button (the user agent is read after mount); the upload sheet says what is read from the receipt and its button reads "Upload" (or "Upload N Photos"), with the board's messages for photos over 10 MB and HEIC; the lists screen is titled "Lists" without a back link; deleting a list says how many items go with it; an empty list offers Add Item and Upload Receipt, and its Start Shopping opens the sheet that explains why it cannot start; Start Shopping shows the estimated total and "One trip at a time per list."; setting a usual store says "Usual store set to <store>. It won’t change on its own." with an Undo; the average price sits at the right of each item; a read receipt is titled "Review receipt" with its date, item count and total, shows the store card above the items ("Read as …", "Change Store") and warns when the items read add up to under 90% of the printed total; the trip chooser lists the date and store of each trip and puts trips at the receipt's store first; and a change you make no longer produces a "List updated" notice from its own realtime echo. No API or database change.
- OCR no longer reports a failed read as a receipt with no items. A photo whose request failed (a busy or down provider, a dropped connection), whose answer was blocked, cut off or only reasoning, or whose answer was not JSON used to count as a photo with zero items, so a receipt could finish "completed" with 0 items and no error and spend one of its three attempts (seen once with test-receipt-1.jpg; the second read found 18 items). Now, when no photo gave an item and any photo failed, the Gemini function marks the receipt failed with an error message (and answers 502), a busy provider (408, 429, 5xx) or a dropped connection is retried once, Gemini's reasoning parts are skipped when reading the answer, and the OpenAI function fails on an empty answer instead of reading it as `[]`. Photos that were all read and held no item still complete with 0 items. New shared module supabase/functions/_shared/ocr-outcome.ts (pure, 22 Vitest tests). **Not deployed:** process-ticket-ocr-gemini and process-ticket-ocr-openai need a manual deploy; the legacy process-ticket-ocr is not called by the app and was left as it is. Not verified against the provider: only the decision logic is tested, and the cause of the one observed empty read was not confirmed (no function logs).
- Complete-trip sheet: "Ready to Complete Shopping?" now opens by itself when the last item of a trip is ticked. Ticking an item re-renders the page from the server, which remounted the sheet and lost the move from below 100% to 100%, so it never opened; the last progress seen per trip is now kept outside the component. Opening a trip that already shows 100% still does not open it. Also checked in the browser against the hosted development project: rejected photos (over 10 MB, HEIC) keep the valid ones, the Compare viewer's selection shows on the receipt, renaming a store onto an existing name offers the merge, a failed completion keeps the sheet open with an error toast, and Lists, Receipt, Stores, a store and the dashboard fit at 390 and 1280 px without horizontal overflow. Not covered: the new-account and loading states of the dashboard (no such account here), and an inline "Try Again" after a failed completion (the board draws one; the app shows a toast).
- E2E harness and dev environment: every E2E entry point reads its Supabase target through `e2e/helpers/e2e-env.ts`, which accepts only the `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY` and `E2E_SUPABASE_SERVICE_ROLE_KEY` inputs (never the application's credentials) and only loopback destinations with an explicit port, so a run cannot reach the hosted project; the global teardown no longer wipes tables; the legacy table-wide reset helpers need that validated local target plus `E2E_ALLOW_DB_RESET=true`; `playwright.config.ts` starts a dedicated `next dev` against the E2E Supabase and never reuses a running server; `create-test-user.mjs` works on a local Supabase only with generated credentials; and `pnpm test:e2e:helpers` runs the harness guards (14 pure tests; Playwright ignores them). Also: `next.config.ts` rewrites icon-package barrel imports (`optimizePackageImports`) and `tsconfig.json` drops the leftover `.next-codex*` and `.codex-preview-*` globs. Not verified: no local Supabase is provisioned here, so no browser spec ran, and the compile-time effect of `optimizePackageImports` was not measured. Still open: the per-test fixture ownership of `openspec/changes/stabilize-test-foundation`.
- Lighter receipt review, V3 board F6: the sections of a read receipt are "Needs a look", "New to <list>" and "Matched to <list>"; "Select all N" is "Accept All N", which shows "N accepted" with an "Undo" once the matching lines are selected (accepting is selecting: nothing is added until "Add to a List" is confirmed); and when every line matches, the screen says so ("All 14 items match Pantry. Same names as last time. Nothing needs a look."). OpenSpec change `light-review-board-labels`; no API or database change. Left out: moving "New to <list>" into "Needs a look" as the board draws it.
- Dashboard, V3 board F6: "This Month" is now "Spend This Month" and lists what was spent at each store (up to five, largest first, from completed trips and receipts not attached to a trip), under the total; "Up Next" gains "<list> is running low" (the list with the most items whose usual interval has passed) and "Someone is shopping “<list>”" with "Join the trip" when another person has an active trip on a shared list (names are not available, so it says "Someone"), and shows up to four entries. API v1, additive: `stores` and `other_total` on `GET /spending` (`[{ id, name, total }]`, and what the total holds beyond them, such as receipts without a confirmed store, shown as "Other"; both empty or zero if the breakdown cannot be read, the total is unaffected). No database change. Left out: an "Up Next" entry for receipts with lines that need a look, which needs an agreed definition and a per-receipt count.
- My Stores, V3 board F3: each store card says when it was last visited and how many items it is the usual store of ("Last 28 Oct 2026 · 14 items usually here"), marks a store with one receipt as "New", and opens a store screen (`/stores/{id}`) with its receipts, usual items, what was spent there since 1 January (completed trips plus receipts not attached to a trip) and the names its receipts print, each removable except the store's own name; removing one makes receipts that print it ask which store they belong to. Merging two stores now waits six seconds behind an Undo (the merged store's card hides meanwhile; leaving the page runs it at once). API v1, additive: `usual_items_count` on store reads, `GET /stores/{id}` (counts, `spent_since`, `spent_total`, `names`) and `DELETE /stores/{id}/aliases/{aliasId}` (`204`; `422` for the store's own name; `404` for a name that is not the store's). No database change.
- Usual store, V3 board F4: the sheet that sets an item's usual store opens with the item's name and says how the store is decided ("Automatic · No Frills — Bought there 5 of 7 times. Follows your receipts.", "Set by you · Costco — It stays there until you change it.", or how many purchases it takes to learn one), shows for each store when and at what price the item was last bought there ("Last $6.29 · 19 Feb 2026", "Not bought there yet"), and ends with "A store you pick stays until you change it. Receipts won’t move it."; item reads add `usual_store.purchase_count` and `purchase_total` (additive). A list whose items have usual stores gets "Show items from" (All Stores, each store with its items, No Usual Store), kept in the URL as `?store=`; it only narrows the screen, and a trip still starts from the whole list.
- Lists screen, V3 board F2: each card names its last trip ("Last trip 28 Oct 2026" or "No trips yet") and how many people it is shared with, carries a "Default" chip on the account's default list, opens the list with "View Items" (Start Shopping lives on the list and the dashboard; a list being shopped keeps "Resume Shopping" on its card), and its menu has Edit List, Share and Delete List. Deleting a list now waits six seconds behind an Undo (the card hides meanwhile, and leaving the page runs the delete at once). New additive migration `20261101000000_default_list_marker` (`base_lists.is_default`, one per user, the existing Pantry marked, new accounts' Pantry born marked) with rollback-only script `supabase/verification/default-list-marker.sql`; it was applied on 2026-11-01 to the approved development project with `supabase db query --linked` (row counts before and after identical; the rollback-only script passed its 6 checks; no existing list was named Pantry, so none was marked), and the page shows no chip until a list is marked. `database.types.ts` lists the column by hand until the types are regenerated.
- Close the loop, screens of the V3 boards (F5): completing a trip opens its page with "Trip saved" and the invitation to upload receipts (or "Keep It Separate"); a completed trip without a receipt says "No receipts attached" with an "Add Receipt" action, and the 48-hour window; the attach review shows how many lines Matched, are Only on receipt or are Not on receipt, lists the trip items checked off that no receipt line matches, and says when everything matches; a receipt whose items were added to a list explains why it is not offered a trip. The trip page still shows no estimate once the trip is completed. No API or database change.
- Receipt review is lighter: `GET /tickets/{id}/matches` now accepts an optional `base_list_id`; without it, the API chooses the receipt's own list, most recently used list, then oldest owned list. Each line adds nullable `suggestion`, and the response adds nullable `meta.base_list`. Existing clients can continue passing `base_list_id` and ignore the additive response fields; see [API v1](docs/reference/api-v1.md#request-boundaries).
- New dashboard reads are additive in API v1: `GET /base-list-items?filter=likely_needed` (3-purchase minimum, 1-day minimum interval, at most 4 intervals or 120 days overdue, and a 1–10 limit defaulting to 5), `GET /spending?from=...&to=...` (ISO datetimes with offsets, range up to 92 days), and `last_visit` on store rows. The month summary and likely-needed list are designed for the dashboard; see [API v1](docs/reference/api-v1.md#route-inventory) and [reference limits](docs/reference/limits.md#likely-needed-items).
- PRD v3 Phase 5, close the loop: the UI, OCR total extraction, v1 endpoints and additive database migration are implemented in the working tree. After migration application, a read receipt can complete an active trip or reconcile with a trip completed within 48 hours; attached receipts cannot also be merged or used to create a list. Owners can compare the latest recorded receipt prices by store. Visual review found and fixed dialog width overflow on phones and long-content clipping on desktop; review-row link actions now use a 44px target. The user approved the development target `listys`, but its database host did not resolve during verification, so the migration and rollback-only script remain unapplied. The changed OCR Edge Functions are not deployed. The contract is additive in API v1. See [API v1](docs/reference/api-v1.md#compatibility-and-migration) and [implementation status](docs/reference/implementation-status.md#prd-v3-phase-5-close-the-loop).
- PRD v3 Phase 4, store tags and scoped sessions: base-list items learn a usual store from completed purchases, while owners can set a manual store and clear it back to automatic selection. Item reads add a usual-store tag and a purchase-ordered "also at" summary. Starting a session can be scoped to a store; other items stay available in a separate section, and receipt merges without a confirmed store explain that they cannot contribute store evidence. A list can have one active session at a time while different lists can be shopped concurrently; dashboard, list cards, mobile bar and sidebar surface the other active sessions. API v1 remains compatible: optional `store_id`, additive `store`/`is_other_store`/store-summary fields, and a list-scoped `409` that includes `details.activeSessionId`. Additive migration `20261027000000_store_tags_and_scoped_sessions` was applied to the approved development Supabase project after verifying unchanged row counts; its rollback-only verification script passed. See [API v1](docs/reference/api-v1.md#compatibility-and-migration) and [implementation status](docs/reference/implementation-status.md#prd-v3-phase-4-store-tags-and-scoped-sessions).
- PRD v3 Phase 3, stores foundation: the receipt upload asks for photos only and OCR reads the store name from the receipt header in the same request as the items (the Gemini and OpenAI functions; deploying them is a manual step). On a read receipt, a store card proposes the matching store (one-tap Confirm), saves an unknown name as a new store or lets the user choose one; it is optional. A new "My Stores" screen (`/stores`, in the sidebar and the Receipts header) renames and merges stores. Adding receipt lines to an existing list shows a Review Matches step when a line is new or matched by a remembered link: a line can be linked to an item of the list and the link is remembered for later receipts. Underneath: a new `stores` entity owned by each user, with store names normalized (case, accents, spaces, punctuation and branch numbers such as `#3127` are ignored) and aliases, so "No Frills", "NOFRILLS" and "No Frills #3127" are one store. API v1, all additions: `GET/POST /stores`, `PATCH /stores/{id}` (the previous name keeps resolving to the store) and `POST /stores/{id}/merge` (moves receipts and names, removes the merged store, in one transaction); at most `MAX_STORES_PER_USER` (50) stores. Receipts: `PATCH /tickets/{id}` accepts `store_id` (assigning a store remembers the receipt's raw store name as its alias), reads add `store` and `store_suggestion`, the new `GET /tickets/{id}/matches?base_list_id=` says how each line matches a list (same name, a remembered link, or new), and `merge-to-base-list` accepts optional `links` that update an existing item instead of creating one and are remembered per list. `store_name` on upload is now optional and validated (≤ 100 characters), and merge errors are mapped (`409 LIMIT_EXCEEDED` for a full list and `404` instead of a raw `500`). Also fixed: a list created from a receipt now keeps each line's price as the item's starting average price, and the receipt selection bar's buttons are 40px (`primary`) instead of 32px. Additive migration `20261025000000_stores_foundation`; nothing existing is changed or backfilled. See [API v1](docs/reference/api-v1.md#compatibility-and-migration).
- Leaner test suite: removed the Vitest tests that asserted appearance (Tailwind classes, sizes, colours, icons, static copy), tested shadcn primitives, or repeated a helper's coverage, plus the landing showcase E2E spec; the remaining tests cover logic, rules, API routes, actions and services. Vitest resolves `@hugeicons/core-free-icons` to its single-file bundle, which takes a full run from about 11 minutes to under 2. The "shadcn-native first" scan moved out of the default suite to `pnpm check:native-props` (run in `pre-commit`). `AGENTS.md` now forbids tests of third-party code (external libraries and the framework) and of appearance.
- PRD v3 Phase 2, lists without groups: creating a list, creating one from a receipt and merging a receipt no longer ask for a group; a list created without one goes to an implicit default group that `ensure_default_group` creates on first use (also for accounts that already had lists). List names are now unique per user across all lists, not per group, and are compared literally (`%` and `_` are no longer wildcards). API v1, all compatible: `group_id` is optional on `POST /base-lists` and `POST /tickets/{id}/create-base-list`, a supplied `group_id` must be the caller's (`404` otherwise; it was not checked before), `GET /base-lists` adds `notes` and `created_at`, and `create-base-list` rejects a duplicate name with `409`. Nothing is deleted or renamed. See [API v1 compatibility](docs/reference/api-v1.md#compatibility-and-migration).
- PRD v3 Phase 1, session completion: completing a shopping session always applies its checked items to the base list (purchase count, last purchase, average price, new items), with no "Update the Base List" option. Completion and sync run in one database transaction (`complete_shopping_session`), a repeated completion returns `409` without counting twice, and a full list (250 items) no longer blocks the trip: new items that do not fit are skipped and the user is told how many. API v1: `sync_to_base` on `/complete` is deprecated and ignored, the response adds `sync`, and `PATCH /shopping-sessions/{id}` rejects `status: "completed"` with `422`. See [API v1 compatibility](docs/reference/api-v1.md#compatibility-and-migration).
- Reconcile documentation with repository evidence: make `docs/README.md` the topic index, add implementation/API and data-handling references, correct pnpm setup and OCR secret placement, and update contribution/deployment/incident guidance. Preserve PRD v2 as the MVP baseline and identify collaboration as experimental per the 2026-10-17 product decision. Record remaining API, E2E, concurrency and operational gaps without claiming they are fixed.
- Sign in and sign up follow the Design system v2 "Auth" boards (B desktop, C mobile): a mode switch (Sign In / Create Account), a photo panel with an invitation to register, a phone header with the form on a rising white sheet, filled 44px fields with a show/hide password toggle, field errors from Zod (React Hook Form) and a soft-red alert for server errors. New `Button` variants `segment`, `quiet-on-dark` and `inverse` and size `touch`, `Input` `adornment`, `Alert` `destructive-soft`, and `FormField` `hint` and `labelAction`. Removed the frosted `Card variant='glass'`, `CardHeader spacing` and `CardContent inset='top'`, which only the old auth pages used.
- New components are now built from the Design system v2 canvas artifact. `AGENTS.md` has a "Design System v2" rule, and `docs/design/DESIGN.md` links the "Listys - System Design" artifact and its two v2 boards as the source.
- Shopping history cards read "Completed on <date>" and show the session total on the same line; the mockups and the code agree.
- The Add Items to List dialog is a bottom sheet on phones, with a secondary Cancel, a primary "Add N Items" that stays disabled until a list is chosen, and a primary "Create Group" in the no-groups state.

## Unreleased

- Phone sizes below `md`. `Button size='primary'` is the primary action of a screen, sheet or form: `lg` (40px) below `md` and the library's
  `xl` (44px) from `md` up. It replaces `xl` on the toolbar actions (New Group, New Base List, Share, Add Item, Upload), Start Shopping, the confirm
  and submit buttons of the sheets and forms, Copy Link, Create Link and the empty and error call to action of the dashboard. The page headings
  are 24px below `md` (30px from `md`), the hero and session titles 20px below `md` (30px from `md`), and receipt and group cards use `p-3 gap-2`
  below `md`. Desktop values are unchanged. The screen back link (`BackLink` `screen`) uses `primary` too: 40px and 14px on phones, the library's xl from `md`. The viewer controls and the avatar keep their sizes.
- Container spacing is theme, not layout. `CardHeader spacing` (`tight`), `CardContent space` (`snug`, `stack`) and `inset` (`top`, `compact`),
  `DialogHeader variant='sheet'`, `DialogFooter variant` (`inline`, `sheet`), `Collapsible variant='section'` and the A1 defaults of
  `SidebarContent`, `SidebarFooter`, `SidebarGroup` and `SidebarMenu` replace the `space-y-4`, `gap-3`, `pt-6`, `px-4`, `pb-2` and `p-2` strings
  that settings, history, sign-in/up, the sidebar, the sheets and the category sections passed; the guard now flags them. `Button` gained the
  `avatar` size (the account trigger, a circle that becomes a pill from `lg`) and a `weight` prop (the landing header's lighter label), so the two
  allowlist entries for them are gone. `Button size='xl'` is the library's own again (`h-11 px-6 text-base`; the previous pass had changed it to
  `px-4`, `text-sm`). Because two xl buttons no longer fit side by side at 390px, the confirm footers of `ConfirmSheet` (also the complete and cancel
  session sheets) and of the Start Shopping sheet use `DialogFooter variant='sheet'`: stacked with the primary on top below `sm`, two columns
  from `sm`. The scanner moved to `src/test/native-props-scan.cjs` because `scripts/` is git-ignored and the guard could not run from a clean
  clone. The padding of the `RadioGroup` in the merge dialog no longer stacks `space-y-3` on top of its own `gap-3`.
- The "shadcn-native first" rule now reaches every part of the library components and every wrapper, and the guard no longer depends on a
  hand-written component list. `src/test/native-props-scan.cjs` reads the sources with the TypeScript compiler API and finds the wrappers
  by itself (also wrappers of wrappers); it follows classes through `cn()`, templates, ternaries, constants (imported ones too) and any
  `*ClassName` prop, and it flags `buttonVariants()` outside `ui`, hand-styled native `button`/`input`/`textarea`/`select`, links dressed as
  buttons, classes on the child of an `asChild` component, wrappers that take `ButtonProps` and drop them, and `size`/`variant`/`rounded`
  written after `{...props}`. The audit found 105 places (the old guard saw about a dozen): they now go through new native variants.
  `Button` gained `quiet`, `quiet-destructive`, `destructive-ghost`, `ghost-primary`, `floating`, `on-dark`, `viewer`, `overlay` and
  `dropzone`, the `block` size and the `3xl` radius; `DialogContent`/`DialogTitle`/`DialogDescription` have `sheet`, `strong` and `viewer`
  variants, `AlertDialogTitle` `strong` and `AlertDialogMedia` `tone`; `DropdownMenuContent` has `menu` and `account`, its items `touch`,
  `row` and `action` sizes, its label `identity` and its separator `solid`; `Checkbox` has `size` (`lg` = 22px), `Progress` `size`, `tone` and
  `complete` (no more `indicatorClassName`), `Avatar` sizes up to `2xl`, `ring` and a fallback `tone`, `Card` title and description
  variants, `Badge` a `hero` size, `CollapsibleTrigger` a `row` variant and `Label` is the semibold form label by default. The sidebar
  entries, group label and provider carry the A1 look as their default; `--sidebar` is the card white. Tests: `native-props-guard.test.ts`
  rebuilt on the scanner (with fixtures proving each class of mistake is caught) and behaviour tests for every variant above and for each
  wrapper it derives. Visible changes: menu items in the sessions menu are 44px (were 48), the arrows over the photo viewer are 48 (were
  52), "View All" is 32px at every width, the compare dialog's Done button uses the primary fill, and labels without their own class keep the
  20px line height.
- The app's design now rides on shadcn's own props instead of className constants. `Button` has a native scale (`xs` 24, `sm` 32,
  `default` 36, `lg` 40, `xl` 44, `2xl` 52 and the matching icon sizes), a 12px default radius, the Plus Jakarta label and the
  variants the A1 screens need (`secondary` is the grey button with blue text, `destructive` the red confirm, plus `success-soft`,
  `hero` and `fab`); `Input`, `Textarea` and `SelectTrigger` carry the borderless field look with a `size` (`lg` = 44px); `Card` is
  the 24px borderless surface with `size`, `variant` and `interactive`; `Badge` has the status tints and a `lg` size. Because call sites no
  longer pass `h-`, `px-` or `rounded-` classes, `size` and `variant` now obey: wrappers such as `CreateGroupDialog`,
  `CreateBaseListDialog`, `ShareListDialog`, `AddItemSheet`, `StartShoppingDialog` and `UploadTicketDialog` accept the `Button` props
  and default to `size='xl'` (`AddItemSheet` lost its `emphasis` prop: pass `variant`). The 48px actions and fields are now 44px, the hero
  call to action is 52px at every width, and `--radius` is 8px (so `rounded-xl` is the 12px of controls).
- Theme tokens replace literals: `--background` is the `#F2F4F7` page ground, `--secondary` / `--secondary-hover` / `--secondary-foreground` the
  grey button, `--muted` `#F6F7F9`, `--destructive` red-600, `--color-ink` the receipt viewer's dark surface, plus `shadow-card`,
  `shadow-field`, `shadow-premium`, `shadow-glow` and `shadow-fab`. Arbitrary pixel and hex utilities in the app were converted to the
  Tailwind scale and these tokens (text 13/13.5px are now `text-xs`/`text-sm`, titles 32/34px `text-3xl`/`text-4xl`).
- Removed: `components/app/helpers/a1-surface.ts` (`A1_ACTION`, `A1_SECONDARY`, `A1_DANGER`, `A1_TOOLBAR_BUTTON`, `SECONDARY_ACTION`,
  `FIELD_CONTROL`, `FIELD_AREA`, `CARD_SURFACE`, `FOCUS_RING`, `ROW_HOVER`), `features/dashboard/helpers/dashboard-styles.ts`,
  the unused `ActiveShopping` card and the global `.premium-card`, `.hero-mesh`, `.tabular-nums` and `.scan-line` rules. The keyboard
  focus ring is the `focus-ring` utility in `globals.css`.
- The landing page's own CSS moved to `src/app/(marketing)/marketing.css`, which also holds the `.marketing` scope that restores the white
  page, the light secondary and the 6px radius there, so the landing keeps its look under the new app tokens. New guard
  `src/test/native-props-guard.test.ts` fails when a `Button`, `Input`, `Textarea`, `SelectTrigger`, `Card` or `Badge` gets size, spacing,
  radius, colour or typography classes; `AGENTS.md` documents the rule ("shadcn-native first").

- The Lists section follows the approved phone designs: groups, the lists of a group, a list's items, sharing, starting a shopping and the
  shopping session itself. Groups and lists are 24px cards with a tile, one line of description, a `...` menu (Edit and Delete) and a
  `View Details` / `View Items` footer; the creation button moves to the toolbar under the title (the pinned bottom bar that fought the
  tab bar's button is gone), the first-use state is one card with its own button, `loading.tsx` draws a skeleton, rename happens in the
  card ("Name is required" under the field) and every create, edit, delete, share and confirm flow is a bottom sheet on phones
  (`SheetDialog`, `ConfirmSheet`). A list's items are one card with a collapsible section per category (the coloured icon on a grey
  tile, the name as a capitalised 12px caption, a mono count), rows with a quantity chip and a `...` menu, an inline `Edit Item` form,
  `Add Item` as a sheet with field errors, and a delete that offers `Undo` (it adds the item again: the API has no restore). `Start
  Shopping` is the primary action under the list's title (disabled when the list is empty) and is not drawn at all while a shopping
  session is active, on the list and on the dashboard, because only one can run. The share sheet shows a read-only link with `Copy Link`
  / `Link Copied`, `Regenerate`, `Revoke` (it asks first) and the collaborators with a role chip and a confirmation before removing one.
  The shopping session has a `Shopping` chip, a progress card, `done/total` per category, `Share` and `Add Item`, and one small floating
  `Actions` button (a menu with `Complete Shopping` and `Cancel Shopping`) above the tab bar instead of the pinned bar; `Complete` says
  how many items are left or, with all ticked, reads "All Items Checked" with an icon instead of the emoji, and both it and `Cancel` are
  sheets. From `lg` the two actions sit beside the title and the content is capped at 768px.
- New active-session bar (`ActiveSessionBar`, `SessionBar`): on phones, a dark 48px bar above the tab bar with the trip's ring, name,
  "n of m · p%" and `Continue`, shown on every screen except the session's own. It replaces the dashboard-only pill (`MobileSessionBar`
  is gone) and is smaller (it was 72px); the receipt selection bar stacks above it. Lists stays the current tab on a list and on a
  session. `tickets/receipt/helpers/ticket-category-icon.ts` moved to `commons/category-section` and now also gives each category its
  own colour, so receipts and lists share one category section; category names there are the capitalised caption too.
- Shared pieces for forms and cards: `components/commons` gains `SheetDialog`, `ConfirmSheet`, `FormField`, `EntityCard`,
  `EntityEditCard`, `CreateEntitySheet`, `EntityCardSkeleton`, `ListToolbar`, `EmptyStateCard`, `CategorySection` and `RowMenu`;
  `features/list-items` holds the item forms (`AddItemSheet`, `ItemEditForm`, `ItemQuantityChip`); `formatItemName` and a generic
  `groupByCategory` live in `utils`. Removed: `EditGroupDialog` (unused), `AddItemDialogBaseList`, `ActionsItemFormBaseList`,
  `CompleteSessionAlert`, `CompleteSessionButton`, `CancelSessionButton` and the sharing utils for badges and empty states.

- Receipt status chips no longer look like a secondary button: they are 22px pills tinted with their status (Pending slate, Processing
  amber, Completed green, Failed red) with a 12px icon and an 11.5px / 600 label, instead of 26px grey chips with an 8px radius, and the
  receipt card's icon tile is 36px with an 18px icon (it was 48px with a 24px icon), the size of the dashboard's receipt rows.
- `features/tickets` is organised by section instead of one flat folder: `list/` (the receipts list with its cards and empty state, the filter),
  `upload/` (dialog, "Upload Another Receipt" tile, form, photo field, photo picker), `photo/` (pane, viewer, controls with the thumbnail
  strip, the phone row with the desktop panel, zoom and image hooks), `receipt/` (review, items card, items list, selection bar, status
  listener, summary, actions, compare, selection hook and item helpers) and `add-to-list/` (merge and assign dialogs). Following the new
  rule in `AGENTS.md` ("Inline Component Extraction"), presentational children stay in their parent's file (the items card with its empty
  and error states, the items list with its category section and row, the receipts list with its card and empty state), while a child
  with its own logic or used elsewhere has its own file (the realtime status listener, the selection bar, the upload tile). The folder goes
  from 28 component files to 21, and the public barrel adds `TicketsList` and `sumLineTotals`/`toTicketStatus` for the pages.
- `AGENTS.md`: "Inline Component Extraction" now asks for one main component per file without splitting parents into atomic files.
  Presentational children rendered only by their parent stay in its file; a child moves out when it carries its own logic (more than two
  effects, a subscription, async or heavy work), when its state becomes a concern of its own, when it is rendered elsewhere, or when the
  file grows past about 250 lines.
- Receipts on desktop and the "no items detected" state follow the approved mockups. From `lg` the receipt screen is two columns: the items
  card (rows on one line, the selection bar stuck to the bottom of the card) and a right column that stays in view with a `Receipt Photo` panel
  (zoom, rotate, fit, a strip of thumbnails for several photos, `Open Full Screen`) and the summary. The full-screen viewer has a thumbnail
  column, arrows, wheel zoom, drag to pan and keyboard shortcuts (`← →`, `+`, `-`, `0`), and Compare puts the photo on the left of the
  items with a vertical separator. Photo zoom is now relative to the fitted size, so 150% is 1.5x what fits instead of jumping to the full
  width of the box. The receipts list is three columns from `xl` and ends with an `Upload Another Receipt` tile that takes dropped photos;
  the upload form's footer is one row from `sm` and its empty tile reads "Drag and drop photos here". A receipt read with no items shows a
  warning with three tips and `Upload a Clearer Photo`, `Try Again` and `Delete Receipt`. New: `usePhotoView`, `TicketPhotoPanel`,
  `TicketPhotoControls`, `TicketNoItems`, `UploadAnotherTile`, `useMediaQuery`; `UploadTicketDialog` can be controlled and take initial files.
- The icons of the dashboard cards (the group folders and their lists, receipts and history) use the same 100-level tint as the "Up Next"
  rows instead of the paler 50-level one, so the folder of "Shopping List Groups" matches the blue of the cart in "Up Next". `RowIcon`
  no longer has a `soft` emphasis. The phone tab bar is unchanged.
- Receipts on phones follow the approved design. The list shows each receipt as a 24px card (cyan tile, name, status chip, mono
  date and one line about its state: waiting, reading with a progress bar, couldn’t read, or the item count) and the empty state
  has a single primary `Upload Receipt` button with the limits; the second pinned upload bar is gone (the tab bar button is the
  action). The receipt screen opens with the A1 header, a **photo row right under the title** (it used to sit at the very end of
  the page) that opens a full-screen viewer (pinch and double-tap zoom, zoom buttons, rotate, fit, a strip of thumbnails for
  several photos) and a `Compare` view with the photo above the items and a draggable separator. Items are grouped in
  collapsible categories with line icons instead of emoji, names printed in capitals are shown in Title Case, ticking items raises
  an action bar with the count and total, and `Delete Receipt` is soft red. The upload form is a bottom sheet on phones with a
  `Choose Photos` tile, a photo grid with 44px remove targets, an inline message naming a HEIC or oversized file, and a progress
  line while uploading; `Upload` enables with a single valid photo and asks for the name on submit. `PageHeader` gains a `screen` variant (the old white band stays the default), `BackLink` a `screen` variant,
  `Dialog` a `sheetOnPhones` mode, `Checkbox` an indeterminate dash and `Button` a `destructive-soft` variant; the A1 card and
  focus styles are shared from `components/app/helpers/a1-surface.ts`. `formatDate` now returns English month names (it printed
  “Ene”, “Abr”, “Ago”, “Dic”), and `PageHeader`’s invalid `md:text-md` class is `md:text-base`. Desktop keeps the previous layout
  until its design is implemented (see `DESIGN.md` 11.4).
- Typography pass on the landing page and the dashboard, following `docs/design/DESIGN.md` section 4.2. Landing: section headings are
  `750 clamp(32px, 4vw, 48px)` with `-.035em`, step titles the 24px h3, feature titles the 18px h5, section ledes Body large, FAQ and
  footer text on the 12/14/16px steps, mono overlines at 11px with `.1em`, and buttons at weight 600. The hero title is now the
  `Display` role (`800 clamp(44px, 7vw, 76px)`, two lines on desktop) with a new `Hero lead` under it. The hero no longer overflows
  a phone viewport by 40px, which had pushed its text to 2px from the edge. Dashboard: the hero title is 30px (32px from `md`)
  instead of 40px, the in-between sizes (12.5, 13, 13.5, 14.5, 15px) moved to the 12/14/16px steps, mono metadata uses `.01em`
  tracking and weight 500, and the overline is weight 600. Other pages are untouched; their gaps are listed in section 11.4.
- Text of buttons and links is Title Case across the app ("View All", "Sign Out", "Continue Shopping", "New Group", "Try Again",
  "Install App", "Add Item", "Generate Link", "View Details", "Sign In with Email", "Create Free Account"…), and the rule is
  written in `docs/design/DESIGN.md` section 7.1. Headings, descriptions, toasts and data keep sentence case.
- Polish the dashboard on phone and desktop. The loading skeleton now mirrors the current layout (the hero next to "Up Next" from
  `lg`, each section with its title row above its card, the Upload button only from `lg`), reads on the `#F2F4F7` page ground
  and stops pulsing for people who ask for less motion (`Skeleton` now has `motion-reduce:animate-none`). Long names no longer
  stretch the page: row metadata and the hero's origin clamp at two lines, truncated titles show their full text on hover, and the
  list names in the groups card are 44px-tall targets instead of 19px text links. The error card uses the same 24px radius at every
  width, and text selection in the dashboard is themed blue.
- Dashboard section titles (Shopping List Groups, Receipts, Shopping History) and "Up Next" are still `h2` elements but are set at the
  h6 size on phones (16px, 600) and at the h4 size from `md` (20px).
- Redesign the phone account menu (design "A1 mobile · Menú de usuario"): the avatar is a 44px circle that rests on the secondary
  surface while the menu is open, which now has a 263px panel with a 44px identity block, 52px Dashboard, Profile and Account rows
  (a grey icon tile and a regular 14px title), a full-width Sign out button, and a scrim over the page and the tab bar. From `lg` it keeps
  the pill trigger and drops Dashboard, Profile and Account, which live in the sidebar.
- Implement design A1 desktop. The sidebar is now the shadcn floating variant: a 240px white card with the Listys brand, groups
  titled in semibold, 36px one-line entries with an 18px icon and the current page on the secondary-button surface, and the running
  trip and credit at the foot. The top bar sits on the page ground with the sidebar trigger (also Ctrl/Cmd+B, which now hides the
  sidebar entirely instead of collapsing it to icons), a hairline and the breadcrumb, and the account pill gains a chevron.
  Desktop dashboard sizes follow the board: 34px greeting, 40px hero title, 36/40px hero padding, 36px section gaps, the
  secondary-surface "Upload Receipt" button and 36px quick-start chips at every width. The redesigned surfaces now write their
  8px and 12px radii explicitly, because `--radius` makes `rounded-lg` and `rounded-xl` 6px and 10px.
- Realign `docs/design/DESIGN.md` with the Design system v2 canvas: grey `#F2F4F7` canvas with layered surfaces instead of
  borders, the v2 radii (12/16/24/28), shadows, type scale and button set, the secondary-button surface for the current
  navigation item, a new section 6.5 for the dashboard and phone shell, and the gaps between the canvas and the code in 11.4.
- Implement design A1 mobile. The phone shell is now a 60px header with the logo and the account button, and a bottom tab bar
  (Dashboard, Lists, a raised Upload Receipt button, Receipts, History) that replaces the side-sheet drawer; Profile and
  Account moved into the account menu. The running trip's pill floats above the tab bar and stays visible next to the hero's
  button. Dashboard cards follow the design: each section's title and "View all" sit above a white card with simple rows, a
  grey "Start" pill and tinted empty states; "Up Next" is one white card; the date is a white pill; the hero chip says
  "Shopping now"; buttons of the empty states are primary. The page ground is `#F2F4F7` and the receipts card previews three
  rows. Removed `MobileNavDrawer`, `MobileNavPanel`, `MobileNavAccount` and their tests. The Design system v2 canvas gained
  a "Móvil A1" section with the shell, the section cards and their measurements.
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
- Git hooks (Husky): `pre-commit` runs ESLint (errors only) and the tests related to the staged files via lint-staged, then the
  critical suite (`pnpm test:critical`: server actions, API routes, lib, stores, utils); `pre-push` runs `pnpm typecheck`
  (`tsc --noEmit`), the check that `next build` fails on. The shared Supabase test helpers moved back to `src/test/helpers`
  (the commit that moved the tests had deleted them, which broke 5 test files and the type check).
- Accessibility: pinch-zoom is no longer disabled (`maximum-scale` and `user-scalable` removed), the mobile drawer has a 44px
  close button, a 312px width and a 44px author-credit link, and `<main>` has `scroll-padding-bottom` so focus is not hidden
  behind fixed bottom bars. `StartShoppingDialog` accepts an optional `size`.
- `CreateGroupDialog` accepts optional `variant` and `className` for its trigger.
- `GET /api/v1/base-lists` now also returns `items` (a count of each list's items). Additive; existing fields are unchanged.
- Initialize documentation system and add PRD, ADR template, runbooks, and contributing guide.
