/**
 * Button, card and border values of the approved A1 dashboard design. Where they differ from the generic scale in
 * DESIGN.md (24px card radius, 12px controls) the A1 values win on this surface.
 */

/** 2px action-blue ring with a 2px offset on keyboard focus (DESIGN.md §10.2), shared by every dashboard link. */
export const FOCUS_RING =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/*
 * Secondary buttons (the `outline` variant of Button) are neutral with a blue glyph, everywhere. Colour comes from the
 * variant; these only set size and radius. Hierarchy on this screen: one blue primary per region, neutral secondary
 * actions, and plain text links.
 */

/** Page-level secondary action (header "Upload Receipt"): 44px high, 12px radius. */
export const SECONDARY_ACTION = 'h-11 w-auto rounded-[12px] px-4.5 text-sm font-semibold'

/** Secondary action inside a card: small on phones (32px), regular from `md` up (44px). */
export const CARD_ACTION = 'h-8 w-auto rounded-[12px] px-3 text-xs font-semibold md:h-11 md:px-4.5 md:text-sm'

/** Hero call to action: 50px, 12px radius, blue glow and a 1px lift on hover, on top of the shared primary highlight layer. */
export const HERO_CTA =
	'h-[50px] rounded-[12px] px-6 text-[15.5px] font-bold shadow-[0_16px_30px_-16px_rgba(37,99,235,0.75)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_18px_34px_-14px_rgba(37,99,235,0.8)] motion-reduce:transition-none motion-reduce:hover:translate-y-0'

/** Quick-start chip: small on phones, regular from `md` up. */
export const QUICK_START_CHIP = 'min-h-8 gap-2 px-3 text-xs md:min-h-10 md:px-4 md:text-sm'
