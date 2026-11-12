import Link from 'next/link'
import { ListViewIcon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { CreateBaseListDialog, StartShoppingDialog } from '@/components/features/base-lists'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { pluralize, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	lists: DashboardModel['lists']
	activeSessionIds: DashboardModel['activeSessionIds']
}

/** Shopping Lists: the user's lists, one row each with its item count and a way to start shopping from it. */
export function ListsSectionCard({ lists, activeSessionIds }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-lists-card'
			title='Lists'
			viewAll={{ href: '/shopping-lists', noun: 'lists', testId: 'dashboard-lists-view-all' }}
		>
			{lists.items.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-lists-empty'
					icon={ListViewIcon}
					tone='primary'
					title='No lists yet.'
					message='Create one with the things you always buy, or start from a receipt.'
					action={<CreateBaseListDialog />}
				/>
			) : (
				<ul className='flex flex-1 flex-col gap-px'>
					{lists.items.slice(0, 3).map(list => (
						<li
							key={list.id}
							data-testid={`dashboard-list-${list.id}`}
							className='flex items-center gap-2.5 rounded-[18px] bg-muted/70 p-2 transition-colors duration-150 hover:bg-background dark:bg-muted/50 dark:hover:bg-muted'
						>
							<RowIcon
								icon={ListViewIcon}
								tone='primary'
								size='md'
							/>
							<Link
								href={`/base-lists/${list.id}/edit`}
								className='-my-2 flex min-h-14 min-w-0 flex-1 items-center rounded-md text-sm text-text-secondary dark:text-foreground/80 focus-ring'
							>
								<span className='flex min-w-0 flex-col gap-1'>
										<span className='flex min-w-0 flex-wrap items-center gap-1.5 font-semibold text-foreground'>
										<span className='min-w-0 truncate'>{list.name}</span>
										{list.isDefault ? <Badge variant='list-default'><HugeiconsIcon icon={StarIcon} strokeWidth={1.8} aria-hidden='true' />Default</Badge> : null}
									</span>
									<span className='text-xs leading-normal text-muted-foreground'>{pluralize(list.itemsCount, 'item')} <span aria-hidden='true'>·</span> {list.lastTrip ? `Last trip ${list.lastTrip}` : 'No trips yet'}</span>
								</span>
							</Link>
							<StartShoppingDialog
								baseListId={list.id}
								baseListName={list.name}
								itemsCount={list.itemsCount}
								sessionActive={Boolean(activeSessionIds[list.id])}
								activeSessionId={activeSessionIds[list.id]}
								variant='secondary'
								size='sm'
								className='w-auto'
							>
								Start
							</StartShoppingDialog>
						</li>
					))}
				</ul>
			)}
		</DashboardSectionCard>
	)
}
