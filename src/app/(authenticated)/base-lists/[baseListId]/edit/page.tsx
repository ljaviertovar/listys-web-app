import { notFound, redirect } from 'next/navigation'
import { StarIcon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { createClient } from '@/lib/supabase/server'

import { PageContainer, PageHeader } from '@/components/app'
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
import { Badge } from '@/components/ui/badge'

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
		notFound()
	}

	const isOwner = (baseList as { is_owner?: boolean }).is_owner !== false
	const baseListWithItems = baseList as BaseListWithItems & { is_default?: boolean; collaborators?: Array<{ id: string }> }
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
	const { data: lastTrip } = await supabase
		.from('shopping_sessions')
		.select('completed_at')
		.eq('base_list_id', baseListId)
		.eq('status', 'completed')
		.not('completed_at', 'is', null)
		.order('completed_at', { ascending: false })
		.limit(1)
		.maybeSingle()
	const lastTripLabel = lastTrip?.completed_at
		? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(lastTrip.completed_at))
		: 'No trips yet'
	const collaboratorCount = baseListWithItems.collaborators?.length ?? 0

	return (
		<>
			<PageHeader
				layout='detail'
				entity='list'
				back={{ href: '/shopping-lists', label: 'Back to Lists' }}
				title={baseListWithItems.name}
				desc={baseListWithItems.notes ? <p className='line-clamp-2'>{baseListWithItems.notes}</p> : undefined}
				chips={[
					baseListWithItems.is_default ? <Badge key='default' variant='outline'><HugeiconsIcon icon={StarIcon} strokeWidth={1.8} aria-hidden='true' />Default</Badge> : null,
					collaboratorCount > 0 ? <Badge key='shared' variant='outline'><HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.8} aria-hidden='true' />Shared · {collaboratorCount}</Badge> : null,
				]}
				facts={[
					{ kind: 'count', value: items.length, unit: items.length === 1 ? 'item' : 'items' },
					lastTrip?.completed_at ? { value: `Last trip ${lastTripLabel}` } : null,
				]}
			/>

			<PageContainer>
				<div className='flex w-full max-w-3xl flex-col gap-4'>
					{items.length > 0 ? <div className='flex flex-col gap-2'>
						<StartShoppingDialog
							baseListId={baseListId}
							baseListName={baseListWithItems.name}
							itemsCount={items.length}
							items={items}
							sessionActive={!!activeSession}
							activeSessionId={activeSession?.id}
							showBlockedNotice
							className='w-full'
						/>

						<div className='grid grid-cols-2 gap-3' data-testid='base-list-actions'>
							{isOwner && (
								<ShareListDialog
									baseListId={baseListId}
									listName={baseListWithItems.name}
									isOwner={isOwner}
									size='default'
									className={isOwner ? 'w-full' : 'col-span-2 w-full'}
								/>
							)}
							<AddItemSheet
								target={{ context: 'base-list', baseListId }}
								isLocked={isLocked}
								size='default'
								className={isOwner ? 'w-full' : 'col-span-2 w-full'}
							/>
						</div>
					</div> : null}

					{items.length > 0 ? (
							<UsualStoreFilter
								options={storeOptions}
								value={storeFilter}
								totalCount={items.length}
							/>
						) : null}

						<BaseListItems
						baseListId={baseListId}
						listName={baseListWithItems.name}
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
