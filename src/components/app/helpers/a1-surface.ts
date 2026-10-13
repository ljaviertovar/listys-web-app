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

/** 48px text field of the A1 forms: borderless on the card surface with a hairline ring; the invalid state swaps it for a red 2px ring. */
export const FIELD_CONTROL =
	'h-12 rounded-[16px] border-0 bg-card px-3.5 text-base shadow-[0_0_0_1px_rgba(15,23,42,0.1),0_2px_6px_-2px_rgba(15,23,42,0.1)] focus-visible:ring-2 aria-invalid:ring-2 aria-invalid:ring-red-600 md:text-[15px]'

/** Multi-line twin of `FIELD_CONTROL`: same surface and ring, as tall as its rows need. */
export const FIELD_AREA =
	'min-h-[72px] rounded-[16px] border-0 bg-card px-3.5 py-3 text-base shadow-[0_0_0_1px_rgba(15,23,42,0.1),0_2px_6px_-2px_rgba(15,23,42,0.1)] focus-visible:ring-2 aria-invalid:ring-2 aria-invalid:ring-red-600 md:text-[15px]'

/** 48px action of a sheet or form footer: 12px radius, Plus Jakarta label. */
export const A1_ACTION = 'h-12 rounded-[12px] font-display text-[15px] font-semibold'

/** Secondary look of `A1_ACTION`: the grey button surface with blue text. */
export const A1_SECONDARY =
	'border-0 bg-[#E9ECF0] text-blue-700 shadow-none hover:bg-[#DEE2E8] dark:bg-muted dark:text-blue-300 dark:hover:bg-muted/80'

/** Red confirm of a destructive sheet (design action-danger #DC2626). */
export const A1_DANGER = 'border-0 bg-red-600 text-white shadow-none hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'

/** The 44px button of a screen toolbar (New Group, Add Item, Share): 12px radius and the display face; the variant sets its colour. */
export const A1_TOOLBAR_BUTTON = 'h-11 gap-2 rounded-[12px] px-4 font-display text-sm font-semibold'
