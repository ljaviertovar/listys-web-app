/**
 * Button, card and border values of the approved A1 dashboard design. Where they differ from the generic scale in
 * DESIGN.md (24px card radius, 12px controls) the A1 values win on this surface.
 */

/** 2px action-blue ring with a 2px offset on keyboard focus (DESIGN.md §10.2), shared by every dashboard link. */
export const FOCUS_RING =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Page-level secondary action (header "Upload Receipt"): 44px high, 12px radius, on the secondary-button surface. Desktop only: phones upload from the tab bar. */
export const SECONDARY_ACTION =
	'h-11 w-auto rounded-[12px] border-0 bg-[#E9ECF0] px-4.5 text-sm font-semibold text-blue-700 shadow-none hover:bg-[#DEE2E8]'

/** Primary button of an empty section card: compact on phones, full-size from tablet width. */
export const EMPTY_STATE_ACTION = 'h-8 w-auto rounded-[12px] px-3 text-xs font-semibold md:h-11 md:px-4.5 md:text-sm'

/** Soft grey "Start" pill next to each list in the groups card: 32px high, no border, 12px radius. */
export const START_ACTION =
	'h-8 w-auto rounded-[12px] border-0 bg-[#E9ECF0] px-3.5 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-[#DEE2E8]'

/** Row hover wash of the section cards (the design's page grey). */
export const ROW_HOVER = 'hover:bg-[#F2F4F7] dark:hover:bg-muted'

/** Hero call to action: 52px, 12px radius, blue glow and a 1px lift on hover, on top of the shared primary highlight layer. */
export const HERO_CTA =
	'h-[52px] gap-2.5 rounded-[12px] md:self-start px-7 text-base font-bold shadow-[0_14px_28px_-14px_rgba(37,99,235,0.85)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_18px_32px_-14px_rgba(37,99,235,0.9)] motion-reduce:transition-none motion-reduce:hover:translate-y-0'

/** Shortcut chip to a list under the hero: 36px high with 12.5px text at every width (design A1). */
export const QUICK_START_CHIP = 'min-h-9 gap-1.5 px-[11px] text-[12.5px]'

/** White surface of every dashboard card (design A1): a hairline ring plus a soft two-layer shadow instead of a border. */
export const CARD_SURFACE =
	'rounded-3xl border-0 bg-card shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.04),0_6px_20px_-8px_rgba(15,23,42,0.12)] dark:border dark:shadow-none'
