import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ABOVE_MOBILE_TAB_BAR } from '@/components/app/helpers/mobile-tab-bar-layout'
import { cn } from '@/utils'

const RING_RADIUS = 15
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export interface SessionBarProps {
	id: string
	name: string
	/** Null while the count is still loading: the bar then says only that the trip is in progress. */
	progress: { checked: number; total: number } | null
}

/**
 * Phones only (design A1 mobile): a dark 48px bar floating above the tab bar that leads back to the running shopping
 * session from any other screen. The whole bar is the link; "Continue" only borrows the primary button's look. The raised
 * upload button overlaps its lower edge, so the bar sits just under its z-index.
 */
export function SessionBar({ id, name, progress }: SessionBarProps) {
	const percent = progress && progress.total > 0 ? Math.round((progress.checked / progress.total) * 100) : 0
	const filled = (percent / 100) * RING_CIRCUMFERENCE

	return (
		<div
			data-testid='active-session-bar'
			className={cn('fixed inset-x-0 z-30 px-3 pb-2 lg:hidden', ABOVE_MOBILE_TAB_BAR)}
		>
			<Link
				href={`/shopping/${id}`}
				className={cn(
					'flex h-12 items-center gap-2.5 rounded-2xl bg-slate-900 py-1.5 pr-1.5 pl-2.5 text-white shadow-[0_10px_22px_-14px_rgba(15,23,42,0.6)]',
					'focus-ring',
				)}
			>
				<span className='relative size-7 shrink-0'>
					<svg
						viewBox='0 0 36 36'
						className='size-7'
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
					<span className='absolute top-0 right-0 size-2 rounded-full border-[1.5px] border-slate-900 bg-green-400' />
				</span>
				<span className='flex min-w-0 flex-1 flex-col gap-0.5'>
					<span className='truncate font-display text-xs leading-[1.2] font-bold'>{name}</span>
					<span className='font-mono text-xs leading-[1.2] text-slate-300 tabular-nums'>
						{progress ? `${progress.checked} of ${progress.total} · ${percent}%` : 'In progress'}
					</span>
				</span>
				{/* Not a nested control: the whole bar is the link, this only borrows the primary button's look. */}
				<Button
					asChild
					size='sm'
					rounded='lg'
				>
					<span>
						Continue<span className='sr-only'> Shopping</span>
					</span>
				</Button>
			</Link>
		</div>
	)
}
