import { TimeQuarterPassIcon } from '@hugeicons/core-free-icons'

import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { SectionFooterLink } from './section-footer-link'
import type { TripPreview } from './helpers/build-dashboard-model'
import { formatCurrency } from '@/utils'

interface Props {
	trips: TripPreview[]
	count: number
}

/** Shopping History: the latest completed shopping sessions with what each one cost. */
export function HistorySectionCard({ trips, count }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-history-card'
			icon={TimeQuarterPassIcon}
			tone='success'
			title='Shopping History'
			description='View past shopping sessions and their details.'
			count={count}
			countLabel={count === 1 ? 'session' : 'sessions'}
			footer={
				<SectionFooterLink
					href='/shopping-history'
					testId='dashboard-history-view-all'
				>
					View all history
				</SectionFooterLink>
			}
		>
			{trips.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-history-empty'
					message='No shopping sessions yet. Completed sessions show up here with their totals.'
				/>
			) : (
				trips.map(trip => (
					<DashboardRow
						key={trip.id}
						href={trip.href}
						title={trip.name}
						meta={trip.meta}
						monoMeta
						testId={`dashboard-trip-${trip.id}`}
						trailing={
							trip.total !== null ? (
								<span className='font-mono text-sm font-semibold tabular-nums'>{formatCurrency(trip.total)}</span>
							) : null
						}
					/>
				))
			)}
		</DashboardSectionCard>
	)
}
