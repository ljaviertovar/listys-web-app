import { Store03Icon } from '@hugeicons/core-free-icons'

import { formatCurrency } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from '@/components/commons'
import type { DashboardModel } from './helpers/build-dashboard-model'

interface Props { visits: DashboardModel['storeVisits'] }

export function StoreVisitsCard({ visits }: Props) {
	return (
		<DashboardSectionCard testId='dashboard-store-visits-card' title='Last Trip by Store' cardSize='dashboard-compact' viewAll={{ href: '/stores', noun: 'stores', testId: 'dashboard-store-visits-view-all' }}>
			{visits.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-store-visits-empty'
					icon={Store03Icon}
					tone='store'
					title='No store visits yet.'
					message='Confirm a receipt’s store or choose one when you start a trip.'
				/>
			) : (
				<div className='flex flex-1 flex-col gap-px'>
					{visits.slice(0, 3).map(visit => (
						<DashboardRow
							key={visit.storeId}
							href={visit.href}
							title={visit.storeName}
							meta={visit.itemsCount == null ? visit.dateLabel : `${visit.dateLabel} · ${visit.itemsCount} ${visit.itemsCount === 1 ? 'item' : 'items'}`}
							monoMeta
							density='compact'
							leading={<RowIcon icon={Store03Icon} tone='store' size='md' />}
							trailing={visit.total !== null ? <span className='shrink-0 font-mono text-sm font-semibold tabular-nums'>{formatCurrency(visit.total)}</span> : undefined}
							testId={`dashboard-store-visit-${visit.storeId}`}
							className='rounded-[18px] bg-muted/70 dark:bg-muted/50'
						/>
					))}
				</div>
			)}
		</DashboardSectionCard>
	)
}
