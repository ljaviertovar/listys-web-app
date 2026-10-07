import Link from 'next/link'
import { FolderIcon, FolderLibraryIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { StartShoppingDialog } from '@/components/features/base-lists'
import { cn } from '@/utils'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { SectionFooterLink } from './section-footer-link'
import { pluralize, type GroupPreview } from './helpers/build-dashboard-model'
import { CARD_ACTION, FOCUS_RING } from './helpers/dashboard-styles'

interface Props {
	groups: GroupPreview[]
	count: number
}

/** Shopping List Groups: each group with the lists inside it, so the group → list → start path is visible at a glance. */
export function GroupsSectionCard({ groups, count }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-groups-card'
			icon={FolderLibraryIcon}
			tone='primary'
			title='Shopping List Groups'
			description='Manage your shopping list groups and their lists.'
			count={count}
			countLabel={count === 1 ? 'group' : 'groups'}
			footer={
				<SectionFooterLink
					href='/shopping-lists'
					testId='dashboard-groups-view-all'
				>
					View all groups
				</SectionFooterLink>
			}
		>
			{groups.length === 0 ? (
				<p className='px-3 py-4 text-[13px] leading-[1.55] text-muted-foreground'>
					No groups yet. Create one for each store you shop at, like Walmart or Costco.
				</p>
			) : (
				groups.map(group => (
					<div
						key={group.id}
						data-testid={`dashboard-group-${group.id}`}
						className='flex flex-col'
					>
						<DashboardRow
							href={`/shopping-lists/${group.id}/lists`}
							title={group.name}
							testId={`dashboard-group-link-${group.id}`}
							leading={
								<span className='flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-50 text-slate-500 dark:bg-muted'>
									<HugeiconsIcon
										icon={FolderIcon}
										strokeWidth={1.5}
										className='size-[18px]'
									/>
								</span>
							}
							trailing={<span className='text-[13px] text-muted-foreground'>{pluralize(group.listsCount, 'list')}</span>}
						/>
						<ul className='ml-6 flex flex-col border-l-2 border-slate-200 pl-2 dark:border-border'>
							{group.lists.map(list => (
								<li
									key={list.id}
									data-testid={`dashboard-list-${list.id}`}
									className='flex min-h-14 items-center gap-2 rounded-[12px] px-2 py-1'
								>
									<Link
										href={`/base-lists/${list.id}/edit`}
										className={cn('flex min-w-0 flex-1 flex-col gap-1 rounded-md hover:underline', FOCUS_RING)}
									>
										<span className='truncate text-sm font-medium leading-[1.2]'>{list.name}</span>
										<span className='text-[13px] leading-[1.55] text-muted-foreground'>{pluralize(list.itemsCount, 'item')}</span>
									</Link>
									<StartShoppingDialog
										baseListId={list.id}
										baseListName={list.name}
										itemsCount={list.itemsCount}
										variant='outline'
										className={CARD_ACTION}
									/>
								</li>
							))}
							{group.hiddenListsCount > 0 ? (
								<li className='px-2'>
									<Link
										href={`/shopping-lists/${group.id}/lists`}
										className={cn(
											'inline-flex min-h-11 items-center rounded-md text-[13px] font-medium text-muted-foreground hover:text-primary hover:underline',
											FOCUS_RING,
										)}
									>
										+ {group.hiddenListsCount} more in {group.name}
									</Link>
								</li>
							) : null}
						</ul>
					</div>
				))
			)}
		</DashboardSectionCard>
	)
}
