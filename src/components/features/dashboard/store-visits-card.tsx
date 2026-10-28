import { Store01Icon } from '@hugeicons/core-free-icons'

import { formatCurrency } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import type { DashboardModel } from './helpers/build-dashboard-model'

interface Props { visits: DashboardModel['storeVisits'] }

export function StoreVisitsCard({ visits }: Props) {
	return (
		<DashboardSectionCard testId='dashboard-store-visits-card' title='Last Trip by Store' viewAll={{ href: '/stores', noun: 'stores', testId: 'dashboard-store-visits-view-all' }}>
			{visits.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-store-visits-empty'
					icon={Store01Icon}
					tone='ocr'
					title='No store visits yet.'
					message='Confirm a receipt’s store or choose one when you start a trip.'
				/>
			) : (
				<div className='flex flex-1 flex-col gap-1'>
					{visits.map(visit => (
						<DashboardRow
							key={visit.storeId}
							href={visit.href}
							title={visit.storeName}
							meta={visit.dateLabel}
							monoMeta
							leading={<RowIcon icon={Store01Icon} tone='ocr' size='md' />}
							trailing={visit.total !== null ? <span className='shrink-0 font-mono text-sm font-semibold tabular-nums'>{formatCurrency(visit.total)}</span> : undefined}
							testId={`dashboard-store-visit-${visit.storeId}`}
						/>
					))}
				</div>
			)}
		</DashboardSectionCard>
	)
}
