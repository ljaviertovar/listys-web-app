'use client'

import type { ReactNode } from 'react'

import { InlineCounter, SyncStatusLine } from '@/components/commons'
import { cn } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

import { StartShoppingDialog } from '../start-shopping-dialog'
import { BaseListItems } from './base-list-items'
import { filterItemsByUsualStore, type StoreFilterOption } from './helpers/filter-items-by-store'
import { useNeededItems } from './hooks/use-needed-items'
import { NeededSelectionBar } from './needed-selection-bar'
import { UsualStoreFilter } from './usual-store-filter'

interface BaseListShoppingProps {
	baseListId: string
	baseListName: string
	items: BaseListItemWithStoreSummary[]
	storeOptions: StoreFilterOption[]
	storeFilter: string | null
	isOwner: boolean
	activeSessionId?: string
	/** The list's own actions (share, add item), between "Start Shopping" and the filter. */
	children: ReactNode
}

/**
 * The working part of a list screen. It holds the checks once, so the rows, both "Start Shopping" buttons and the bar
 * always agree on what the next trip takes, even before a save reaches the server.
 */
export function BaseListShopping({
	baseListId,
	baseListName,
	items: serverItems,
	storeOptions,
	storeFilter,
	isOwner,
	activeSessionId,
	children,
}: BaseListShoppingProps) {
	const { items, setNeeded, isSaving, saveFailed, retry } = useNeededItems(baseListId, serverItems)
	// "Show items from" narrows the screen only; a trip is still decided over the whole list.
	const shownItems = filterItemsByUsualStore(items, storeFilter)
	// A list that is being shopped is locked, checks included.
	const isLocked = Boolean(activeSessionId)
	const hasBar = !isLocked && items.some(item => item.needed_at)
	const showSyncStatus = (items.length > 0 && !isLocked) || isSaving

	return (
		<div className={cn('flex w-full max-w-3xl flex-col gap-4', hasBar && 'max-lg:pb-24')}>
			{items.length > 0 || showSyncStatus ? (
				<div className='-mt-4 flex w-full items-center justify-between gap-3' data-testid='base-list-count-sync-row'>
					{items.length > 0 ? (
						<InlineCounter count={items.length} one='item' many='items' testId='base-list-item-count' />
					) : (
						<span aria-hidden='true' />
					)}
					{showSyncStatus ? (
						<div data-testid='needed-sync-status'>
							<SyncStatusLine
								message={saveFailed ? 'Not saved' : isSaving ? 'Saving…' : 'Saved'}
								icon={saveFailed ? undefined : isSaving ? 'saving' : 'saved'}
								onRetry={saveFailed ? retry : undefined}
							/>
						</div>
					) : null}
				</div>
			) : null}
			{items.length > 0 ? (
				<>
					<div className='flex flex-col gap-2'>
						<StartShoppingDialog
							baseListId={baseListId}
							baseListName={baseListName}
							itemsCount={items.length}
							items={items}
							sessionActive={isLocked}
							activeSessionId={activeSessionId}
							showBlockedNotice
							className='w-full'
						/>
						{children}
					</div>
					<UsualStoreFilter options={storeOptions} value={storeFilter} totalCount={items.length} />
				</>
			) : null}

			<BaseListItems
				baseListId={baseListId}
				listName={baseListName}
				items={shownItems}
				hasChecks={items.some(item => item.needed_at)}
				onSetNeeded={setNeeded}
				isLocked={isLocked}
				isOwner={isOwner}
				footer={
					hasBar ? (
						<NeededSelectionBar
							baseListId={baseListId}
							baseListName={baseListName}
							items={items}
							shownItems={shownItems}
							saveFailed={saveFailed}
							onClear={() => setNeeded(items, false)}
						/>
					) : null
				}
			/>
		</div>
	)
}
