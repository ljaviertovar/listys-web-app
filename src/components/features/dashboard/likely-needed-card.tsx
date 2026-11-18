import { Clock01Icon, Invoice01Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from '@/components/commons'
import { GET_STARTED_RECEIPTS, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	likelyNeeded: DashboardModel['likelyNeeded']
}

export function LikelyNeededCard({ likelyNeeded }: Props) {
	const receiptsCount = likelyNeeded.receiptsCount ?? 0
	return (
		<DashboardSectionCard testId='dashboard-likely-needed-card' title='Likely Needed' viewAll={{ href: '/shopping-lists', noun: 'lists', testId: 'dashboard-likely-needed-view-all' }}>
			{likelyNeeded.items.length === 0 ? (
				receiptsCount < GET_STARTED_RECEIPTS ? (
					<DashboardEmptyState
						testId='dashboard-likely-needed-progress'
						icon={Invoice01Icon}
						tone='ocr'
						title={`Suggestions start after ${GET_STARTED_RECEIPTS} receipts`}
						message='Listys learns what you buy and when, then shows what is about to run out.'
					/>
				) : (
					<DashboardEmptyState
						testId='dashboard-likely-needed-empty'
						icon={Clock01Icon}
						tone='primary'
						title='Nothing looks due yet.'
						message='Items show up here when their usual interval has passed.'
					/>
				)
			) : (
				<div className='flex flex-1 flex-col gap-1'>
					{likelyNeeded.items.map(item => (
						<DashboardRow
							key={item.id}
							href={`/base-lists/${item.base_list.id}/edit`}
							title={item.name}
							meta={`${item.base_list.name} · ${item.cadence}${item.usual_store ? ` · ${item.usual_store.name}` : ''}`}
							monoMeta
							leading={<RowIcon icon={ShoppingBasket01Icon} tone='primary' size='md' />}
							testId={`dashboard-likely-needed-${item.id}`}
						/>
					))}
				</div>
			)}
		</DashboardSectionCard>
	)
}
