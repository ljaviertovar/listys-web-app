import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils'

interface SessionProgressCardProps {
	checked: number
	total: number
	/** A finished session reads "Purchased" instead of "Collected". */
	isCompleted?: boolean
}

/** How far along the trip is: items collected out of all, the percentage in mono, and a bar that turns green at 100%. */
export function SessionProgressCard({ checked, total, isCompleted = false }: SessionProgressCardProps) {
	const percent = total > 0 ? Math.round((checked / total) * 100) : 0
	const done = percent === 100

	return (
		<section
			aria-label='Shopping progress'
			data-testid='session-progress-card'
			className='flex flex-col gap-3 rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			<div className='flex items-end justify-between gap-2'>
				<div className='flex flex-col gap-1'>
					<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>
						{isCompleted ? 'Purchased' : 'Collected'}
					</span>
					<span className='font-display text-base leading-[1.3] font-semibold'>
						<b className='font-mono font-semibold tabular-nums'>{checked}</b> of{' '}
						<b className='font-mono font-semibold tabular-nums'>{total}</b> {total === 1 ? 'item' : 'items'}
					</span>
				</div>
				<span
					className={cn(
						'font-mono text-2xl leading-none font-semibold tracking-tight tabular-nums',
						done ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-300',
					)}
				>
					{percent}%
				</span>
			</div>
			<Progress
				value={percent}
				aria-label='Items collected in this shopping session'
				size='md'
				tone='track'
				complete={done}
			/>
		</section>
	)
}
