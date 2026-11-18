import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { PageContainer } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { BaseListsList, BaseListsPageHeader, BaseListsSkeleton } from '@/components/features/base-lists'
import { groupStoresByList, type ListItemStoreRow } from '@/components/features/base-lists/helpers/list-card-stores'
import { shouldOfferPantrySetup } from '@/components/features/base-lists/helpers/should-offer-pantry-setup'

import { createClient } from '@/lib/supabase/server'

import { getBaseLists } from '@/lib/api/endpoints'

import type { BaseListWithCount } from '@/types'

/** A list as the API returns it: the item count comes nested as `items: [{ count }]`. */
type BaseListRow = Omit<BaseListWithCount, 'items_count'> & { items?: Array<{ count?: number }> }

export default function ShoppingListsPage() {
	return (
		<>
			<BaseListsPageHeader />
			<PageContainer contentClassName='space-y-2 md:space-y-6'>
				<Suspense fallback={<BaseListsSkeleton />}>
					<BaseListsContent />
				</Suspense>
			</PageContainer>
		</>
	)
}

async function BaseListsContent() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	// These details enrich the cards; the card skeleton stays visible until all parallel queries finish.
	const cardDetails = Promise.all([
		supabase
			.from('shopping_sessions')
			.select('base_list_id, completed_at')
			.eq('status', 'completed')
			.not('completed_at', 'is', null)
			.order('completed_at', { ascending: false })
			.limit(500),
		supabase.from('list_collaborators').select('base_list_id').limit(1000),
		// Until the default-list migration is applied the column does not exist; the query then fails and no chip shows.
		supabase.from('base_lists').select('id').eq('user_id', user.id).eq('is_default', true).limit(1),
		// One row per item that has a usual store; a list with more than the first thousand shows the stores of those only.
		supabase
			.from('base_list_items')
			.select('base_list_id, store:stores!base_list_items_usual_store_id_fkey(id, name)')
			.not('usual_store_id', 'is', null)
			.limit(1000),
	])

	const [baseListsResult, activeSessionResult] = await Promise.all([
		getBaseLists(),
		supabase
			.from('shopping_sessions')
			.select('id, base_list_id')
			.eq('status', 'active')
			.order('started_at', { ascending: false })
			.limit(100),
	])

	const { data: baseLists, error } = baseListsResult
	const { data: activeSessions } = activeSessionResult
	const [completedSessionsResult, collaboratorsResult, defaultListResult, itemStoresResult] = await cardDetails

	const lastTripByList: Record<string, string> = {}
	for (const session of completedSessionsResult.data ?? []) {
		// Newest first, so the first one seen for a list is its last trip.
		if (session.base_list_id && session.completed_at && !(session.base_list_id in lastTripByList)) {
			lastTripByList[session.base_list_id] = session.completed_at
		}
	}
	const sharedCountByList: Record<string, number> = {}
	for (const collaborator of collaboratorsResult.data ?? []) {
		sharedCountByList[collaborator.base_list_id] = (sharedCountByList[collaborator.base_list_id] ?? 0) + 1
	}
	const defaultListId = defaultListResult.data?.[0]?.id ?? null
	const showPantrySetup = shouldOfferPantrySetup({ queryFailed: Boolean(defaultListResult.error), defaultListId })
	const storesByList = groupStoresByList((itemStoresResult.data ?? []) as ListItemStoreRow[])

	// Transform Supabase count result to our type
	const baseListsWithCount: BaseListWithCount[] = ((baseLists ?? []) as BaseListRow[]).map(list => ({
		...list,
		items_count: Array.isArray(list.items) ? list.items[0]?.count || 0 : 0,
	}))

	return error ? (
		<RetryableError
			message='We couldnâ€™t load your lists.'
			href='/shopping-lists'
			testId='base-lists-load-error'
		/>
	) : (
		<BaseListsList
			baseLists={baseListsWithCount}
			activeSessionIds={Object.fromEntries((activeSessions ?? []).map(session => [session.base_list_id, session.id]))}
			defaultListId={defaultListId}
			showPantrySetup={showPantrySetup}
			lastTripByList={lastTripByList}
			sharedCountByList={sharedCountByList}
			storesByList={storesByList}
		/>
	)
}
