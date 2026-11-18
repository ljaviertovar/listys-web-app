'use client'

import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils'
import { TripProgressChart } from './trip-progress-chart'
import { useTripSync } from './hooks/use-trip-sync'
import { visibleTripItems } from './sync/trip-sync-state'
import { summarizeCheckedEstimate } from './helpers/summarize-checked-estimate'
import { describeEstimateBasis } from './helpers/describe-estimate-basis'
import { itemsForSessionProgress } from './helpers/split-session-sections'

type PriceEstimate = { total: number; pricedCount: number; itemCount: number }

type SessionSummaryCardProps = { testId?: string; sessionId?: string; priceByItemId?: Record<string, number> } & (
	| { mode: 'active'; checked: number; total: number; estimate?: PriceEstimate; activeItemScope?: 'all' | 'current-store' }
	| { mode: 'completed'; estimate: PriceEstimate }
)

/**
 * Shows shopping progress while active and only the estimate after completion. While shopping, each fact appears once: the count is
 * in the hole of the progress chart, so the left column holds the estimate and what it is based on (or what is still to collect
 * when no price is known yet).
 */
export function SessionSummaryCard(props: SessionSummaryCardProps) {
	const { state } = useTripSync(props.mode === 'active' ? props.sessionId : null)
	if (props.mode === 'active' && state.initialized) {
		const items = itemsForSessionProgress(visibleTripItems(state), props.activeItemScope === 'current-store')
		props = { ...props, checked: items.filter(item => item.checked).length, total: items.length,
			estimate: props.estimate ? summarizeCheckedEstimate(items, new Map(Object.entries(props.priceByItemId ?? {}))) : undefined }
	}
	const testId = props.testId ?? 'session-summary-card'
	if (props.mode === 'completed' && props.estimate.pricedCount <= 0) return null

	if (props.mode === 'completed') {
		const { estimate } = props
		return (
			<Card aria-label='Estimated total' data-testid={testId} size='receipt'>
				<EstimateFacts
					label='Estimated'
					value={`≈ ${formatCurrency(estimate.total)}`}
					lines={[`${estimate.itemCount} ${estimate.itemCount === 1 ? 'item' : 'items'} · ${estimate.pricedCount} with known prices`]}
				/>
			</Card>
		)
	}

	const { checked, total, estimate } = props
	const remaining = Math.max(0, total - checked)

	return (
		<Card
			aria-label={estimate ? 'Shopping progress and estimated total' : 'Shopping progress'}
			data-testid={testId}
			size='receipt'
		>
			<div className='flex items-center gap-4'>
				{estimate ? (
					<EstimateFacts label='Estimated total' value={`≈ ${formatCurrency(estimate.total)}`} lines={describeEstimateBasis(estimate)} />
				) : (
					<EstimateFacts
						label='Still to collect'
						value={
							remaining === 0 ? (
								'Done'
							) : (
								<>
									{remaining} <span className='font-sans text-sm font-medium tracking-normal'>{remaining === 1 ? 'item' : 'items'}</span>
								</>
							)
						}
						lines={remaining === 0 ? ['Everything is collected'] : ['No known prices for this list yet']}
					/>
				)}
				<TripProgressChart
					checked={checked}
					total={total}
					label='Items collected in this shopping session'
					testId='trip-progress-chart'
				/>
			</div>
		</Card>
	)
}

interface EstimateFactsProps {
	label: string
	value: ReactNode
	lines: string[]
}

function EstimateFacts({ label, value, lines }: EstimateFactsProps) {
	return (
		<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
			<span className='text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>{label}</span>
			<span className='font-mono text-2xl leading-7 font-semibold tracking-tight text-foreground tabular-nums'>{value}</span>
			{lines.map(line => (
				<span key={line} className='text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>{line}</span>
			))}
		</div>
	)
}
