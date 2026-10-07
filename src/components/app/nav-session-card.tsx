import Link from 'next/link'

import { Progress } from '@/components/ui/progress'

interface Props {
	sessionId: string
	name: string
	/** Null while the progress is still loading: the card then shows the name only. */
	progress: { checked: number; total: number } | null
	onNavigate: () => void
}

/** The running shopping session at the foot of the mobile menu: a way back in, with how far along it is. */
export function MobileNavSessionCard({ sessionId, name, progress, onNavigate }: Props) {
	const percent = progress && progress.total > 0 ? Math.round((progress.checked / progress.total) * 100) : 0

	return (
		<Link
			href={`/shopping/${sessionId}`}
			onClick={onNavigate}
			data-testid='mobile-nav-active-session'
			className='flex flex-col gap-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-3.5 text-foreground dark:border-primary/30 dark:bg-primary/10'
		>
			<span className='flex items-center justify-between gap-2'>
				<span className='inline-flex items-center gap-1.5 text-[11px] leading-none font-semibold tracking-[0.08em] text-blue-700 uppercase dark:text-primary'>
					<span
						aria-hidden='true'
						className='size-[7px] rounded-full bg-green-500'
					/>
					Shopping now
				</span>
				{progress ? (
					<span className='font-mono text-xs font-semibold text-blue-700 tabular-nums dark:text-primary'>
						{progress.checked}/{progress.total}
					</span>
				) : null}
			</span>
			<span className='truncate font-display text-[14.5px] leading-tight font-bold'>{name || 'Current shopping'}</span>
			<Progress
				value={percent}
				aria-label='Items collected in this shopping session'
				className='h-1.5 bg-blue-100 dark:bg-primary/20'
				indicatorClassName='bg-primary'
			/>
		</Link>
	)
}
