'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn, formatCurrency } from '@/utils'
import { useTripSync } from './hooks/use-trip-sync'
import { visibleTripItems } from './sync/trip-sync-state'
import { summarizeCheckedEstimate } from './helpers/summarize-checked-estimate'

type PriceEstimate = { total: number; pricedCount: number; itemCount: number }

type SessionSummaryCardProps = { testId?: string; sessionId?: string; priceByItemId?: Record<string, number> } & (
	| { mode: 'active'; checked: number; total: number; estimate?: PriceEstimate }
	| { mode: 'completed'; estimate: PriceEstimate }
)

/** Shows shopping progress while active and only the estimate after completion. */
export function SessionSummaryCard(props: SessionSummaryCardProps) {
	const { state } = useTripSync(props.mode === 'active' ? props.sessionId : null)
	if (props.mode === 'active' && state.initialized) {
		const items = visibleTripItems(state)
		props = { ...props, checked: items.filter(item => item.checked).length, total: items.length,
			estimate: props.estimate ? summarizeCheckedEstimate(items, new Map(Object.entries(props.priceByItemId ?? {}))) : undefined }
	}
	const completed = props.mode === 'completed'
	const estimate = props.estimate
	const testId = props.testId ?? 'session-summary-card'
	if (props.mode === 'completed' && props.estimate.pricedCount <= 0) return null

	const hasEstimate = estimate !== undefined
	const percent = props.mode === 'active' && props.total > 0 ? Math.round((props.checked / props.total) * 100) : 0
	const done = percent === 100

	return (
		<Card
			aria-label={completed ? 'Estimated total' : hasEstimate ? 'Shopping progress and estimated total' : 'Shopping progress'}
			data-testid={testId}
			size='receipt'
		>
			<div className='flex flex-col gap-3'>
				{props.mode === 'active' ? <div className='flex flex-col gap-3'>
					<div className='flex items-end justify-between gap-2'>
						<div className='flex flex-col gap-1'>
							<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>Collected</span>
							<span className='font-display text-base leading-[1.3] font-semibold'>
								<b className='font-mono font-semibold tabular-nums'>{props.checked}</b> of{' '}
								<b className='font-mono font-semibold tabular-nums'>{props.total}</b> {props.total === 1 ? 'item' : 'items'}
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
				</div> : null}
				{estimate ? <>
					{!completed ? <div aria-hidden='true' className='h-px bg-border' /> : null}
					<div className='flex flex-wrap items-end justify-between gap-3'>
						<div className='flex min-w-0 flex-col gap-1'>
							<span className='text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>{completed ? 'Estimated' : 'Estimated total'}</span>
							<span className='font-mono text-2xl leading-none font-semibold tracking-tight text-foreground tabular-nums'>
								≈ {formatCurrency(estimate.total)}
							</span>
						</div>
						<span className='text-right text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
							{estimate.itemCount} {completed ? (estimate.itemCount === 1 ? 'item' : 'items') : 'checked'} · {estimate.pricedCount} with known prices
						</span>
					</div>
				</> : null}
			</div>
		</Card>
	)
}
