import Link from 'next/link'
import { ListViewIcon } from '@hugeicons/core-free-icons'

import { CreateBaseListDialog, StartShoppingDialog } from '@/components/features/base-lists'
import { cn } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import { pluralize, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	lists: DashboardModel['lists']
	/** A shopping session is running, so no list can start another one: the "Start" buttons are not drawn. */
	sessionActive?: boolean
}

/** Shopping Lists: the user's lists, one row each with its item count and a way to start shopping from it. */
export function ListsSectionCard({ lists, sessionActive = false }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-lists-card'
			title='Shopping Lists'
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
				<ul className='flex flex-1 flex-col gap-0.5'>
					{lists.items.map(list => (
						<li
							key={list.id}
							data-testid={`dashboard-list-${list.id}`}
							className='flex items-center gap-2.5 rounded-[14px] p-2 transition-colors duration-150 hover:bg-background dark:hover:bg-muted'
						>
							<RowIcon
								icon={ListViewIcon}
								tone='primary'
								size='sm'
							/>
							<Link
								href={`/base-lists/${list.id}/edit`}
								className='-my-2 flex min-h-11 min-w-0 flex-1 items-center rounded-md text-sm text-slate-700 dark:text-foreground/80 focus-ring'
							>
								<span>
									{list.name} <span className='text-slate-400'>· {pluralize(list.itemsCount, 'item')}</span>
								</span>
							</Link>
							<StartShoppingDialog
								baseListId={list.id}
								baseListName={list.name}
								itemsCount={list.itemsCount}
								sessionActive={sessionActive}
								variant='secondary'
								size='sm'
								className='w-auto'
							>
								Start
							</StartShoppingDialog>
						</li>
					))}
					{lists.hiddenCount > 0 ? (
						<li className='px-2'>
							<Link
								href='/shopping-lists'
								className={cn(
									'inline-flex min-h-9 items-center rounded-md text-sm font-medium text-slate-500 hover:text-blue-700 hover:underline',
									'focus-ring',
								)}
							>
								+ {lists.hiddenCount} more
							</Link>
						</li>
					) : null}
				</ul>
			)}
		</DashboardSectionCard>
	)
}
