import { Invoice01Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StartShoppingDialog } from '@/components/features/base-lists'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from '@/components/commons'
import type { DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	likelyNeeded: DashboardModel['likelyNeeded']
	startTarget?: DashboardModel['startTarget']
}

export function LikelyNeededCard({ likelyNeeded, startTarget = null }: Props) {
	const receiptsCount = likelyNeeded.receiptsCount ?? 0
	return (
		<DashboardSectionCard testId='dashboard-likely-needed-card' title='Likely Needed' viewAll={{ href: '/shopping-lists', noun: 'lists', testId: 'dashboard-likely-needed-view-all' }}>
			{likelyNeeded.items.length === 0 ? (
				receiptsCount < 3 ? (
					<Alert data-testid='dashboard-likely-needed-progress' variant='info' size='dashboard' role='status' aria-live='polite'>
						<div className='flex items-center gap-2'>
							<RowIcon icon={Invoice01Icon} tone='ocr' size='md' />
						<AlertTitle>{receiptsCount} of 3 receipts</AlertTitle>
						</div>
						<AlertDescription>Scan three receipts to start getting suggestions based on what you usually buy.</AlertDescription>
						<Progress value={Math.min(receiptsCount, 3) / 3 * 100} size='sm' tone='soft' aria-label={`${receiptsCount} of 3 receipts scanned`} />
						{startTarget ? (
							<StartShoppingDialog baseListId={startTarget.id} baseListName={startTarget.name} itemsCount={startTarget.itemsCount} size='primary' variant='default' className='w-full sm:w-auto'>Start Shopping</StartShoppingDialog>
						) : (
							<Button asChild size='primary' variant='default' className='w-full sm:w-auto'><Link href='/shopping-lists'>Add items to a list</Link></Button>
						)}
					</Alert>
				) : (
					<DashboardEmptyState
						testId='dashboard-likely-needed-empty'
						icon={ShoppingBasket01Icon}
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
