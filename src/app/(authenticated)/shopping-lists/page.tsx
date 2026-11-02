import { redirect } from 'next/navigation'

import { PageContainer, PageHeader } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { BaseListsList } from '@/components/features/base-lists'

import { createClient } from '@/lib/supabase/server'

import { getBaseLists } from '@/lib/api/endpoints'

import type { BaseListWithCount } from '@/types'

/** A list as the API returns it: the item count comes nested as `items: [{ count }]`. */
type BaseListRow = Omit<BaseListWithCount, 'items_count'> & { items?: Array<{ count?: number }> }

export default async function ShoppingListsPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	// What the cards say besides their name: the last completed trip, who a list is shared with and which one is the default.
	// They run alongside the lists; none of them blocks the page, and a failed one only leaves its detail out.
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
	const [completedSessionsResult, collaboratorsResult, defaultListResult] = await cardDetails

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

	// Transform Supabase count result to our type
	const baseListsWithCount: BaseListWithCount[] = ((baseLists ?? []) as BaseListRow[]).map(list => ({
		...list,
		items_count: Array.isArray(list.items) ? list.items[0]?.count || 0 : 0,
	}))

	return (
		<>
			<PageHeader
				variant='screen'
				title='Lists'
				desc='All your lists in one place. Start with the things you always buy.'
			/>

			<PageContainer>
				{error ? (
					<RetryableError
						message='We couldn’t load your lists.'
						href='/shopping-lists'
						testId='base-lists-load-error'
					/>
				) : (
					<BaseListsList
						baseLists={baseListsWithCount}
						activeSessionIds={Object.fromEntries((activeSessions ?? []).map(session => [session.base_list_id, session.id]))}
							defaultListId={defaultListId}
							lastTripByList={lastTripByList}
							sharedCountByList={sharedCountByList}
					/>
				)}
			</PageContainer>
		</>
	)
}
