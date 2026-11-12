import { redirect } from 'next/navigation'
import { StarIcon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { createClient } from '@/lib/supabase/server'

import { PageContainer, PageHeader } from '@/components/app'
import { DataFigure, DataLine } from '@/components/commons'
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
		return (
			<div className='container mx-auto max-w-4xl space-y-6 p-6'>
				<div className='rounded-xl bg-destructive/10 p-4 text-sm text-destructive'>
					{error || 'Base list not found'}
				</div>
			</div>
		)
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
				variant='screen'
				screenStyle='entity-detail'
				back={{ href: '/shopping-lists', label: 'Back to Lists' }}
				title={baseListWithItems.name}
				desc={(
					<div className='flex flex-col gap-1.5'>
						{baseListWithItems.notes ? <p className='line-clamp-2'>{baseListWithItems.notes}</p> : null}
						{baseListWithItems.is_default || collaboratorCount > 0 ? <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5'>
							{baseListWithItems.is_default ? <Badge variant='list-default'><HugeiconsIcon icon={StarIcon} strokeWidth={1.8} aria-hidden='true' />Default</Badge> : null}
							{collaboratorCount > 0 ? <Badge variant='tag'><HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.8} aria-hidden='true' />Shared · {collaboratorCount}</Badge> : null}
						</div> : null}
						<DataLine testId='list-header-data'>
							<><DataFigure emphasis='count'>{items.length}</DataFigure> {items.length === 1 ? 'item' : 'items'}</>
							{lastTrip?.completed_at ? `Last trip ${lastTripLabel}` : null}
						</DataLine>
					</div>
				)}
			/>

			<PageContainer>
				<div className='flex w-full max-w-3xl flex-col gap-6'>
					{items.length > 0 ? <StartShoppingDialog
						baseListId={baseListId}
						baseListName={baseListWithItems.name}
						itemsCount={items.length}
						items={items}
						sessionActive={!!activeSession}
						activeSessionId={activeSession?.id}
						className='w-full'
					/> : null}

					{items.length > 0 ? <div className='grid grid-cols-2 gap-3' data-testid='base-list-actions'>
						{isOwner && (
							<ShareListDialog
								baseListId={baseListId}
								listName={baseListWithItems.name}
								isOwner={isOwner}
								className={isOwner ? 'w-full' : 'col-span-2 w-full'}
							/>
						)}
						{items.length > 0 && (
							<AddItemSheet
								target={{ context: 'base-list', baseListId }}
								isLocked={isLocked}
								className='w-full'
							/>
						)}
					</div> : null}

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
