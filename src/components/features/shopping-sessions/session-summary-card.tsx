'use client'

import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress'
import { formatCurrency } from '@/utils'
import { useTripSync } from './hooks/use-trip-sync'
import { visibleTripItems } from './sync/trip-sync-state'
import { summarizeCheckedEstimate } from './helpers/summarize-checked-estimate'
import { itemsForSessionProgress } from './helpers/split-session-sections'

type PriceEstimate = { total: number; pricedCount: number; itemCount: number }

type SessionSummaryCardProps = { testId?: string; sessionId?: string; priceByItemId?: Record<string, number> } & (
	| { mode: 'active'; checked: number; total: number; estimate?: PriceEstimate; activeItemScope?: 'all' | 'current-store' }
	| { mode: 'completed'; estimate: PriceEstimate }
)

/**
 * Shows shopping progress while active and only the estimate after completion. The facts read down the left in the order of the data
 * hierarchy (the count, then the estimate, then what the estimate is based on) and the progress is the ring on the right.
 */
export function SessionSummaryCard(props: SessionSummaryCardProps) {
	const { state } = useTripSync(props.mode === 'active' ? props.sessionId : null)
	if (props.mode === 'active' && state.initialized) {
		const items = itemsForSessionProgress(visibleTripItems(state), props.activeItemScope === 'current-store')
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
			<div className='flex items-center gap-4'>
				<div className='flex min-w-0 flex-1 flex-col gap-3'>
					{props.mode === 'active' ? <div className='flex flex-col gap-0.5'>
						<span className='text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>Collected</span>
						<span className='font-display text-base leading-6 font-semibold'>
							<b className='font-mono font-semibold tabular-nums'>{props.checked}</b> of{' '}
							<b className='font-mono font-semibold tabular-nums'>{props.total}</b> {props.total === 1 ? 'item' : 'items'}
						</span>
					</div> : null}
					{estimate ? <>
						{!completed ? <div aria-hidden='true' className='h-px bg-border' /> : null}
						<div className='flex min-w-0 flex-col gap-0.5'>
							<span className='text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>{completed ? 'Estimated' : 'Estimated total'}</span>
							<span className='font-mono text-2xl leading-7 font-semibold tracking-tight text-foreground tabular-nums'>
								≈ {formatCurrency(estimate.total)}
							</span>
							<span className='text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>
								{estimate.itemCount} {completed ? (estimate.itemCount === 1 ? 'item' : 'items') : 'checked'} · {estimate.pricedCount} with known prices
							</span>
						</div>
					</> : null}
				</div>
				{props.mode === 'active' ? (
					<ProgressRing
						value={percent}
						label='Items collected in this shopping session'
						complete={done}
					/>
				) : null}
			</div>
		</Card>
	)
}
