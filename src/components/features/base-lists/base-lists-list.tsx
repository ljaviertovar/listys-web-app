'use client'

import { useCallback, useState } from 'react'
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
	/** The list marked as the account's default, when the database says which one it is. */
	defaultListId?: string | null
	/** When each list was last shopped (a completed trip), and with how many people each is shared, by list id. */
	lastTripByList?: Record<string, string>
	sharedCountByList?: Record<string, number>
}

/** The lists screen: the count with "New Base List" and a grid of cards, or the first-use card with its own button. */
export function BaseListsList({
	baseLists,
	activeSessionIds = {},
	defaultListId = null,
	lastTripByList = {},
	sharedCountByList = {},
}: BaseListsListProps) {
	const [pendingDeletionIds, setPendingDeletionIds] = useState<Set<string>>(() => new Set())
	const visible = baseLists.filter(baseList => !pendingDeletionIds.has(baseList.id))
	const handlePendingVisibilityChange = useCallback((baseListId: string, visible: boolean) => {
		setPendingDeletionIds(current => {
			const next = new Set(current)
			if (visible) next.delete(baseListId)
			else next.add(baseListId)
			return next
		})
	}, [])
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
				className='min-h-5 md:min-h-11'
			/>
			<div
				data-testid='base-lists-grid'
				className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
			>
				{baseLists.map(baseList => (
					<BaseListCard
						key={baseList.id}
						baseList={baseList}
						displayName={displayNames.get(baseList.id)}
						activeSessionId={activeSessionIds[baseList.id]}
							isDefault={baseList.id === defaultListId}
							lastTripAt={lastTripByList[baseList.id] ?? null}
							sharedWithCount={sharedCountByList[baseList.id]}
							onPendingVisibilityChange={isVisible => handlePendingVisibilityChange(baseList.id, isVisible)}
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
