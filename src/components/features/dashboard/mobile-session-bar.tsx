'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils'
import { FOCUS_RING, HERO_CTA_ID } from './helpers/dashboard-styles'
import { pluralize, type ActiveSessionSummary } from './helpers/build-dashboard-model'

const RING_RADIUS = 15
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

interface Props {
	session: ActiveSessionSummary
}

/**
 * Phones only: keeps the shopping session's main action under the thumb while the page scrolls (the bottom-action-bar
 * of DESIGN.md: 94% paper, hairline border, 72px minimum, safe-area padding). It stays out of the way while the hero's own
 * "Continue shopping" button is on screen, so the page never shows two primary buttons for the same action, and slides in
 * once that button scrolls away. On desktop the banner is always in view.
 */
export function MobileSessionBar({ session }: Props) {
	const filled = (session.progress / 100) * RING_CIRCUMFERENCE
	// Hidden until the observer reports: the hero sits at the top, so that is the right answer for the first paint.
	const [heroCtaVisible, setHeroCtaVisible] = useState(true)

	useEffect(() => {
		const heroCta = document.getElementById(HERO_CTA_ID)
		if (!heroCta) return
		const observer = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting))
		observer.observe(heroCta)
		return () => observer.disconnect()
	}, [])

	return (
		<div
			data-testid='dashboard-mobile-session-bar'
			data-hidden={heroCtaVisible}
			aria-hidden={heroCtaVisible}
			inert={heroCtaVisible}
			className={cn(
				'fixed inset-x-0 bottom-0 z-40 min-h-[72px] border-t bg-background/94 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 motion-reduce:transition-none lg:hidden',
				heroCtaVisible && 'translate-y-full',
			)}
		>
			<Link
				href={`/shopping/${session.id}`}
				className={cn('flex min-h-14 items-center gap-3 rounded-2xl bg-slate-900 py-2 pr-2 pl-3 text-white', FOCUS_RING)}
			>
				<span className='relative size-10 shrink-0'>
					<svg
						viewBox='0 0 36 36'
						className='size-10'
						aria-hidden='true'
					>
						<circle
							cx='18'
							cy='18'
							r={RING_RADIUS}
							fill='none'
							strokeWidth='4'
							className='stroke-white/20'
						/>
						<circle
							cx='18'
							cy='18'
							r={RING_RADIUS}
							fill='none'
							strokeWidth='4'
							strokeLinecap='round'
							strokeDasharray={`${filled} ${RING_CIRCUMFERENCE}`}
							transform='rotate(-90 18 18)'
							className='stroke-blue-400'
						/>
					</svg>
					<span className='absolute top-0 right-0 size-2.5 rounded-full border-2 border-slate-900 bg-green-400' />
				</span>
				<span className='flex min-w-0 flex-1 flex-col gap-1'>
					<span className='truncate font-display text-sm leading-[1.2] font-semibold'>{session.name}</span>
					<span className='text-xs leading-[1.2] text-slate-300 tabular-nums'>
						{session.checked} of {pluralize(session.total, 'item')} · {session.progress}%
					</span>
				</span>
				{/* Not a nested control: the whole bar is the link, this only borrows the primary button's look. */}
				<span className={buttonVariants({ size: 'xl', className: 'rounded-[12px] px-4 text-sm font-bold' })}>Continue<span className='sr-only'> shopping</span></span>
			</Link>
		</div>
	)
}
