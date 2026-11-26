import { ButtonLink } from '../commons'

/**
 * Phones only: the price and the call to action pinned to the bottom of the screen while the middle of the page scrolls past. It
 * is sticky inside the wrapper of the middle sections, so it leaves with them before the close repeats the same offer.
 */
export function MobileCtaDock() {
	return (
		<div
			data-testid='landing-mobile-cta-dock'
			className='sticky bottom-0 z-40 flex items-center gap-3 border-t-[1.5px] border-paper-ink bg-white/94 pt-2.5 pr-[max(12px,env(safe-area-inset-right,0px))] pb-[max(14px,env(safe-area-inset-bottom,0px))] pl-[max(18px,env(safe-area-inset-left,0px))] backdrop-blur-md md:hidden'
		>
			<p className='min-w-0 flex-1 leading-tight'>
				<b className='block font-mono text-lg tracking-[-0.02em] text-paper-ink'>$0.00</b>
				<span className='font-mono text-[10px] tracking-[0.08em] text-paper-muted uppercase'>Not a trial · no card</span>
			</p>
			<ButtonLink
				href='/auth/signup'
				size='xl'
				testId='landing-mobile-cta-dock-button'
			>
				Create free account
			</ButtonLink>
		</div>
	)
}
