/**
 * Button, card and border values of the approved A1 dashboard design. Where they differ from the generic scale in
 * DESIGN.md (24px card radius, 12px controls) the A1 values win on this surface.
 */

// Shared with the receipts screens, so they live in the app layer; re-exported to keep the dashboard imports as they were.
export { CARD_SURFACE, FOCUS_RING, ROW_HOVER, SECONDARY_ACTION } from '@/components/app/helpers/a1-surface'

/** Primary button of an empty section card: compact on phones, full-size from tablet width. */
export const EMPTY_STATE_ACTION = 'h-8 w-auto rounded-[12px] px-3 text-xs font-semibold md:h-11 md:px-4.5 md:text-sm'

/** Soft grey "Start" pill next to each list in the groups card: 32px high, no border, 12px radius. */
export const START_ACTION =
	'h-8 w-auto rounded-[12px] border-0 bg-[#E9ECF0] px-3.5 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-[#DEE2E8]'

/** Hero call to action: 52px, 12px radius, blue glow and a 1px lift on hover, on top of the shared primary highlight layer. */
export const HERO_CTA =
	'h-[52px] gap-2.5 rounded-[12px] md:self-start px-7 text-base font-bold shadow-[0_14px_28px_-14px_rgba(37,99,235,0.85)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_18px_32px_-14px_rgba(37,99,235,0.9)] motion-reduce:transition-none motion-reduce:hover:translate-y-0'

/** Shortcut chip to a list under the hero: 36px high with 12.5px text at every width (design A1). */
export const QUICK_START_CHIP = 'min-h-9 gap-1.5 px-[11px] text-[12.5px]'

