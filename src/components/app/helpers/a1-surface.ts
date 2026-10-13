/**
 * Surface and control values of the approved A1 design that more than one screen uses (dashboard, receipts). Where they
 * differ from the generic scale in DESIGN.md (24px card radius, 12px controls) the A1 values win on these surfaces.
 */

/** 2px action-blue ring with a 2px offset on keyboard focus (DESIGN.md §10.2), shared by every A1 link and control. */
export const FOCUS_RING =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Page-level secondary action (header "Upload Receipt"): 44px high, 12px radius, on the secondary-button surface. Desktop only: phones upload from the tab bar. */
export const SECONDARY_ACTION =
	'h-11 w-auto rounded-[12px] border-0 bg-[#E9ECF0] px-4.5 text-sm font-semibold text-blue-700 shadow-none hover:bg-[#DEE2E8]'

/** Row hover wash of the section cards (the design's page grey). */
export const ROW_HOVER = 'hover:bg-[#F2F4F7] dark:hover:bg-muted'

/** White surface of every A1 card: a hairline ring plus a soft two-layer shadow instead of a border. */
export const CARD_SURFACE =
	'rounded-3xl border-0 bg-card shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.04),0_6px_20px_-8px_rgba(15,23,42,0.12)] dark:border dark:shadow-none'
