import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ABOVE_MOBILE_UPLOAD_BUTTON } from '@/components/app/helpers/mobile-tab-bar-layout'
import { cn } from '@/utils'

const RING_RADIUS = 15
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export interface SessionBarProps {
	id: string
	name: string
	/** Null while the count is still loading: the bar then says only that the trip is in progress. */
	progress: { checked: number; total: number } | null
	otherCount?: number
}

/**
 * Phones only (design A1 mobile): a dark bar, styled like the receipt selection bar, floating above the tab bar that leads back to the running shopping
 * session from any other screen. The whole bar is the link; "Continue" only borrows the primary button's look. The raised
 * upload button overlaps its lower edge, so the bar sits just under its z-index.
 */
export function SessionBar({ id, name, progress, otherCount = 0 }: SessionBarProps) {
	const percent = progress && progress.total > 0 ? Math.round((progress.checked / progress.total) * 100) : 0
	const filled = (percent / 100) * RING_CIRCUMFERENCE

	return (
		<div
			data-testid='active-session-bar'
			className={cn('fixed inset-x-0 z-30 px-3 pb-2 lg:hidden', ABOVE_MOBILE_UPLOAD_BUTTON)}
		>
			<div className='flex items-center gap-2'>
			<Link
				href={`/shopping/${id}`}
				className={cn(
					'flex items-center gap-2 rounded-3xl bg-slate-900 py-2.5 pr-2.5 pl-4 text-white shadow-[0_16px_32px_-12px_rgba(15,23,42,0.5)]',
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
					<span className='truncate text-sm leading-[1.2] font-semibold'>{name}</span>
					<span className='font-mono text-xs leading-[1.2] text-slate-300 tabular-nums'>
						{progress ? `${progress.checked} of ${progress.total} · ${percent}%` : 'In progress'}
					</span>
				</span>
				{/* Not a nested control: the whole bar is the link, this only borrows the primary button's look. */}
				<Button
					asChild
					size='sm'
				>
					<span>
						Continue<span className='sr-only'> Shopping</span>
					</span>
				</Button>
			</Link>
			{otherCount > 0 ? (
				<Link href='/shopping-lists' aria-label={`+${otherCount} more in progress`} data-testid='active-session-more-link' className='shrink-0 rounded-2xl bg-slate-800 px-3 py-2 text-center text-xs font-semibold leading-tight text-white focus-ring'>
					+{otherCount} more<span className='sr-only'> shopping sessions in progress</span>
				</Link>
			) : null}
			</div>
		</div>
	)
}
