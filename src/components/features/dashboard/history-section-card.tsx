import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import type { TripPreview } from './helpers/build-dashboard-model'
import { formatCurrency } from '@/utils'

interface Props {
	trips: TripPreview[]
}

/** Shopping History: the latest completed shopping sessions with what each one cost. */
export function HistorySectionCard({ trips }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-history-card'
			title='Shopping History'
			viewAll={{ href: '/shopping-history', noun: 'history', testId: 'dashboard-history-view-all' }}
		>
			{trips.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-history-empty'
					icon={ShoppingCart02Icon}
					tone='success'
					title='No shopping sessions yet.'
					message='Completed sessions show up here with their totals.'
				/>
			) : (
				<div className='flex flex-1 flex-col gap-1'>
					{trips.map(trip => (
						<DashboardRow
							key={trip.id}
							href={trip.href}
							title={trip.name}
							meta={trip.meta}
							monoMeta
							testId={`dashboard-trip-${trip.id}`}
							leading={
								<RowIcon
									icon={ShoppingCart02Icon}
									tone='success'
									size='md'
								/>
							}
							trailing={
								trip.total !== null ? (
									<span className='font-mono text-[13.5px] font-semibold tabular-nums'>{formatCurrency(trip.total)}</span>
								) : null
							}
						/>
					))}
				</div>
			)}
		</DashboardSectionCard>
	)
}
