import { ShoppingBasket01Icon } from '@hugeicons/core-free-icons'

import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import type { DashboardModel } from './helpers/build-dashboard-model'

interface Props { likelyNeeded: DashboardModel['likelyNeeded'] }

export function LikelyNeededCard({ likelyNeeded }: Props) {
	return (
		<DashboardSectionCard testId='dashboard-likely-needed-card' title='Likely Needed' viewAll={{ href: '/shopping-lists', noun: 'lists', testId: 'dashboard-likely-needed-view-all' }}>
			{likelyNeeded.items.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-likely-needed-empty'
					icon={ShoppingBasket01Icon}
					tone='warning'
					title={likelyNeeded.hasHistory ? 'Nothing looks due yet.' : 'No buying rhythm yet.'}
					message={likelyNeeded.hasHistory ? 'Items show up here when their usual interval has passed.' : 'After a few trips, items you buy regularly show up here.'}
				/>
			) : (
				<div className='flex flex-1 flex-col gap-1'>
					{likelyNeeded.items.map(item => (
						<DashboardRow
							key={item.id}
							href={`/base-lists/${item.base_list.id}/edit`}
							title={item.name}
							meta={`${item.base_list.name} · ${item.cadence}${item.usual_store ? ` · ${item.usual_store.name}` : ''}`}
							monoMeta
							leading={<RowIcon icon={ShoppingBasket01Icon} tone='warning' size='md' />}
							testId={`dashboard-likely-needed-${item.id}`}
						/>
					))}
				</div>
			)}
		</DashboardSectionCard>
	)
}
