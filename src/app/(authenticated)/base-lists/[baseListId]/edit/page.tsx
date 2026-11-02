import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { PageContainer, PageHeader } from '@/components/app'
import { ListToolbar } from '@/components/commons'
import {
	BaseListItems,
	BaseListRealtimeListener,
	StartShoppingDialog,
	UsualStoreFilter,
	buildStoreFilterOptions,
	filterItemsByUsualStore,
	resolveStoreFilter,
} from '@/components/features/base-lists'
import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'

import { getBaseList } from '@/actions'

import type { BaseListWithItems } from '@/types'

export default async function EditBaseListPage({
	params,
	searchParams,
}: {
	params: Promise<{ baseListId: string }>
	searchParams: Promise<{ store?: string | string[] }>
}) {
	const { baseListId } = await params
	const { store: requestedStore } = await searchParams
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: baseList, error } = await getBaseList(baseListId)

	if (error || !baseList) {
		return (
			<div className='container mx-auto max-w-4xl space-y-6 p-6'>
				<div className='rounded-xl bg-destructive/10 p-4 text-sm text-destructive'>
					{error || 'Base list not found'}
				</div>
			</div>
		)
	}

	const isOwner = (baseList as { is_owner?: boolean }).is_owner !== false
	const baseListWithItems = baseList as BaseListWithItems
	const items = baseListWithItems.items ?? []
	// "Show items from": only the screen narrows; starting a trip still takes the whole list.
	const storeOptions = buildStoreFilterOptions(items)
	const storeFilter = resolveStoreFilter(items, [requestedStore].flat()[0])
	const shownItems = filterItemsByUsualStore(items, storeFilter)

	// RLS includes collaborator sessions; the per-list constraint guarantees at most one active result.
	const activeSessionResult = await supabase
		.from('shopping_sessions')
		.select('id, name')
		.eq('base_list_id', baseListId)
		.eq('status', 'active')
		.maybeSingle()

	// This list is being shopped: it is locked until the session ends.
	const isLocked = !!activeSessionResult.data
	const activeSession = activeSessionResult.data

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/shopping-lists', label: 'Back to Lists' }}
				title={baseListWithItems.name}
				desc='Manage items in this base list'
			/>

			<PageContainer>
				<div className='flex w-full max-w-3xl flex-col gap-6'>
					<StartShoppingDialog
						baseListId={baseListId}
						baseListName={baseListWithItems.name}
						itemsCount={items.length}
						items={items}
						sessionActive={!!activeSession}
						activeSessionId={activeSession?.id}
						className='sm:w-fit'
					/>

					<ListToolbar
						count={shownItems.length}
						unit={{ one: 'item', many: 'items' }}
						testId='base-list-toolbar'
					>
						{isOwner && (
							<ShareListDialog
								baseListId={baseListId}
								listName={baseListWithItems.name}
								isOwner={isOwner}
							/>
						)}
						{items.length > 0 && (
							<AddItemSheet
								target={{ context: 'base-list', baseListId }}
								isLocked={isLocked}
							/>
						)}
					</ListToolbar>

					{storeOptions.length > 0 ? (
							<UsualStoreFilter
								options={storeOptions}
								value={storeFilter}
								totalCount={items.length}
							/>
						) : null}

						<BaseListItems
						baseListId={baseListId}
						items={shownItems}
						isLocked={isLocked}
						isOwner={isOwner}
					/>
				</div>
			</PageContainer>

			<BaseListRealtimeListener baseListId={baseListId} />
		</>
	)
}
