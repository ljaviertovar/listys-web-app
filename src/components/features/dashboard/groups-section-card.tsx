import Link from 'next/link'
import { Folder01Icon, ListViewIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { StartShoppingDialog } from '@/components/features/base-lists'
import { CreateGroupDialog } from '@/components/features/shopping-lists'
import { cn } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import { pluralize, type GroupPreview } from './helpers/build-dashboard-model'
import { EMPTY_STATE_ACTION, FOCUS_RING, START_ACTION } from './helpers/dashboard-styles'

interface Props {
	groups: GroupPreview[]
}

/** Shopping List Groups: each group with the lists inside it, so the group → list → start path is visible at a glance. */
export function GroupsSectionCard({ groups }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-groups-card'
			title='Shopping List Groups'
			viewAll={{ href: '/shopping-lists', noun: 'groups', testId: 'dashboard-groups-view-all' }}
		>
			{groups.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-groups-empty'
					icon={Folder01Icon}
					tone='primary'
					title='No groups yet.'
					message='Create one for each store you shop at, like Walmart or Costco.'
					action={
						<CreateGroupDialog className={EMPTY_STATE_ACTION}>
							<HugeiconsIcon
								icon={PlusSignIcon}
								strokeWidth={1.8}
								className='size-[18px]'
							/>
							New group
						</CreateGroupDialog>
					}
				/>
			) : (
				<div className='flex flex-1 flex-col gap-1.5'>
					{groups.map(group => (
						<div
							key={group.id}
							data-testid={`dashboard-group-${group.id}`}
							className='flex flex-col gap-0.5'
						>
							<DashboardRow
								href={`/shopping-lists/${group.id}/lists`}
								title={group.name}
								testId={`dashboard-group-link-${group.id}`}
								className='gap-2.5 p-2'
								leading={
									<RowIcon
										icon={Folder01Icon}
										tone='primary'
										size='sm'
									/>
								}
								trailing={<span className='text-[12.5px] text-slate-500 dark:text-muted-foreground'>{pluralize(group.listsCount, 'list')}</span>}
							/>
							<ul className='ml-6 flex flex-col gap-0.5'>
								{group.lists.map(list => (
									<li
										key={list.id}
										data-testid={`dashboard-list-${list.id}`}
										className='flex items-center gap-2.5 border-l-2 border-slate-200 px-2 py-1.5 dark:border-border'
									>
										<RowIcon
											icon={ListViewIcon}
											tone='primary'
											size='xs'
										/>
										<Link
											href={`/base-lists/${list.id}/edit`}
											className={cn('min-w-0 flex-1 rounded-md text-[13.5px] text-slate-700 hover:underline dark:text-foreground/80', FOCUS_RING)}
										>
											{list.name} <span className='text-slate-400'>· {pluralize(list.itemsCount, 'item')}</span>
										</Link>
										<StartShoppingDialog
											baseListId={list.id}
											baseListName={list.name}
											itemsCount={list.itemsCount}
											className={START_ACTION}
										>
											Start
										</StartShoppingDialog>
									</li>
								))}
								{group.hiddenListsCount > 0 ? (
									<li className='border-l-2 border-slate-200 px-2 dark:border-border'>
										<Link
											href={`/shopping-lists/${group.id}/lists`}
											className={cn(
												'inline-flex min-h-9 items-center rounded-md text-[13px] font-medium text-slate-500 hover:text-blue-700 hover:underline',
												FOCUS_RING,
											)}
										>
											+ {group.hiddenListsCount} more in {group.name}
										</Link>
									</li>
								) : null}
							</ul>
						</div>
					))}
				</div>
			)}
		</DashboardSectionCard>
	)
}
