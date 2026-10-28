import { ListViewIcon } from '@hugeicons/core-free-icons'

import { EmptyStateCard, EntityCardSkeleton, ListToolbar } from '@/components/commons'
import { Skeleton } from '@/components/ui/skeleton'
import { buildListDisplayNames } from '@/utils'

import type { BaseListWithCount } from '@/types'

import { BaseListCard } from './base-list-card'
import { CreateBaseListDialog } from './create-base-list-dialog'

interface BaseListsListProps {
	baseLists: BaseListWithCount[]
	activeSessionIds?: Record<string, string>
}

/** The lists screen: the count with "New Base List" and a grid of cards, or the first-use card with its own button. */
export function BaseListsList({ baseLists, activeSessionIds = {} }: BaseListsListProps) {
	const visible = baseLists
	// Named against every list, the shopped one included, so a suffix never changes while a trip is running.
	const displayNames = buildListDisplayNames(baseLists)

	if (visible.length === 0) {
		return (
			<EmptyStateCard
				icon={ListViewIcon}
				title='No lists yet'
				description='A base list is a template you reuse every time you shop. Start with the things you always buy.'
				testId='base-lists-empty-state'
			>
				<CreateBaseListDialog />
			</EmptyStateCard>
		)
	}

	return (
		<>
			<ListToolbar
				count={visible.length}
				unit={{ one: 'list', many: 'lists' }}
				testId='base-lists-toolbar'
			>
				<CreateBaseListDialog />
			</ListToolbar>
			<div
				data-testid='base-lists-grid'
				className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
			>
				{visible.map(baseList => (
					<BaseListCard
						key={baseList.id}
						baseList={baseList}
						displayName={displayNames.get(baseList.id)}
						activeSessionId={activeSessionIds[baseList.id]}
					/>
				))}
			</div>
		</>
	)
}

/** What the lists screen shows while its data loads: the toolbar and three card shapes. */
export function BaseListsSkeleton() {
	return (
		<div
			data-testid='base-lists-skeleton'
			className='flex flex-col gap-4'
		>
			<div className='flex min-h-11 items-center justify-between'>
				<Skeleton className='h-3.5 w-16 rounded-md' />
				<Skeleton className='h-11 w-32 rounded-xl' />
			</div>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{[0, 1, 2].map(index => (
					<EntityCardSkeleton
						key={index}
						testId={`base-list-card-skeleton-${index}`}
					/>
				))}
			</div>
		</div>
	)
}
