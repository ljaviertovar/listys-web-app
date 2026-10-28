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

	// Transform Supabase count result to our type
	const baseListsWithCount: BaseListWithCount[] = ((baseLists ?? []) as BaseListRow[]).map(list => ({
		...list,
		items_count: Array.isArray(list.items) ? list.items[0]?.count || 0 : 0,
	}))

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Shopping Lists'
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
					/>
				)}
			</PageContainer>
		</>
	)
}
