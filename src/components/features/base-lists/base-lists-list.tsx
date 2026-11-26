'use client'


import { EmptyStateCard, EntityCardSkeleton } from '@/components/commons'
import { buildListDisplayNames } from '@/utils'

import type { BaseListWithCount } from '@/types'

import { BaseListCard } from './base-list-card'
import type { ListCardStore } from './helpers/list-card-stores'
import { CreateBaseListDialog } from './create-base-list-dialog'
import { SetUpPantryCallout } from './set-up-pantry-callout'

interface BaseListsListProps {
	baseLists: BaseListWithCount[]
	activeSessionIds?: Record<string, string>
	/** The list marked as the account's default, when the database says which one it is. */
	defaultListId?: string | null
	/** Offers "Set up Pantry": the account has no default list and the database could say so. */
	showPantrySetup?: boolean
	/** When each list was last shopped (a completed trip), and with how many people each is shared, by list id. */
	lastTripByList?: Record<string, string>
	sharedCountByList?: Record<string, number>
	/** The stores the items of each list are usually bought at, by list id, the most used first. */
	storesByList?: Record<string, ListCardStore[]>
}

/** The lists screen: a grid of cards, or the first-use card with its own button. The page header owns the primary action. */
export function BaseListsList({
	baseLists,
	activeSessionIds = {},
	defaultListId = null,
	showPantrySetup = false,
	lastTripByList = {},
	sharedCountByList = {},
	storesByList = {},
}: BaseListsListProps) {
	// Named against every list, the shopped one included, so a suffix never changes while a trip is running.
	const displayNames = buildListDisplayNames(baseLists)
	const orderedLists = defaultListId
		? [...baseLists].sort((a, b) => Number(b.id === defaultListId) - Number(a.id === defaultListId))
		: baseLists

	if (baseLists.length === 0) {
		return (
			<>
				{showPantrySetup ? <SetUpPantryCallout testId='lists-page-pantry-setup' /> : null}
				<EmptyStateCard
					stub={{ label: 'Lists', count: '0 lists' }}
					ghost='list'
					title='No lists yet'
					description='A base list is a template you reuse every time you shop. Start with the things you always buy.'
					testId='base-lists-empty-state'
				>
					<CreateBaseListDialog />
					<p className='font-mono text-xs text-muted-foreground'>Or fill one from a receipt</p>
				</EmptyStateCard>
			</>
		)
	}

	return (
		<>
			{showPantrySetup ? <SetUpPantryCallout testId='lists-page-pantry-setup' /> : null}
			<div
				data-testid='base-lists-grid'
				className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
			>
				{orderedLists.map(baseList => (
					<BaseListCard
						key={baseList.id}
						baseList={baseList}
						displayName={displayNames.get(baseList.id)}
						activeSessionId={activeSessionIds[baseList.id]}
							isDefault={baseList.id === defaultListId}
							lastTripAt={lastTripByList[baseList.id] ?? null}
							sharedWithCount={sharedCountByList[baseList.id]}
							stores={storesByList[baseList.id]}
					/>
				))}
			</div>
		</>
	)
}

/** What the lists screen shows while its data loads: three card shapes. */
export function BaseListsSkeleton() {
	return (
		<div
			data-testid='base-lists-skeleton'
			className='flex flex-col gap-4'
		>
			<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{[0, 1, 2].map(index => (
					<EntityCardSkeleton
						key={index}
						testId={`base-list-card-skeleton-${index}`}
						kind='list'
					/>
				))}
			</div>
		</div>
	)
}
