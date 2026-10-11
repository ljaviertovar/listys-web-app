import Link from 'next/link'

import { ABOVE_MOBILE_TAB_BAR } from '@/components/app'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils'
import { FOCUS_RING } from './helpers/dashboard-styles'
import { pluralize, type ActiveSessionSummary } from './helpers/build-dashboard-model'

const RING_RADIUS = 15
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

interface Props {
	session: ActiveSessionSummary
}

/**
 * Phones only (design A1 mobile): a dark pill floating just above the tab bar that keeps the running trip's progress
 * and its main action under the thumb while the page scrolls. It stays visible next to the hero's own button, as in the
 * approved design. On desktop the banner is always in view.
 */
export function MobileSessionBar({ session }: Props) {
	const filled = (session.progress / 100) * RING_CIRCUMFERENCE

	return (
		<div
			data-testid='dashboard-mobile-session-bar'
			// Under the tab bar's z-40, so the raised upload button overlaps the pill like in the design.
			className={cn('fixed inset-x-0 z-30 px-3 pb-2.5 lg:hidden', ABOVE_MOBILE_TAB_BAR)}
		>
			<Link
				href={`/shopping/${session.id}`}
				className={cn(
					'flex min-h-[72px] items-center gap-3 rounded-[20px] bg-slate-900 py-2 pr-2 pl-3 text-white shadow-[0_14px_30px_-16px_rgba(15,23,42,0.6)]',
					FOCUS_RING,
				)}
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
					<span className='absolute top-0 right-0 size-[9px] rounded-full border-2 border-slate-900 bg-green-400' />
				</span>
				<span className='flex min-w-0 flex-1 flex-col gap-[3px]'>
					<span className='truncate font-display text-[14.5px] leading-[1.2] font-bold'>{session.name}</span>
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
