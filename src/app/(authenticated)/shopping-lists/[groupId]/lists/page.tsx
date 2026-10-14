import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { PageContainer, PageHeader } from '@/components/app'
import { BaseListsList } from '@/components/features/base-lists'

import { getBaseListsByGroup } from '@/lib/api/endpoints'

import type { BaseListWithCount } from '@/types'

/** A list as the API returns it: the item count comes nested as `items: [{ count }]`. */
type BaseListRow = Omit<BaseListWithCount, 'items_count'> & { items?: Array<{ count?: number }> }

export default async function BaseListsPage({ params }: { params: Promise<{ groupId: string }> }) {
	const { groupId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const [baseListsResult, groupResult, activeSessionResult] = await Promise.all([
		getBaseListsByGroup(groupId),
		supabase.from('groups').select('name').eq('id', groupId).single(),
		supabase
			.from('shopping_sessions')
			.select('id, base_list_id')
			.eq('user_id', user.id)
			.eq('status', 'active')
			.maybeSingle(),
	])

	const { data: baseLists, error } = baseListsResult
	const { data: group } = groupResult
	const { data: activeSession } = activeSessionResult

	// Transform Supabase count result to our type
	const baseListsWithCount: BaseListWithCount[] = ((baseLists ?? []) as BaseListRow[]).map(list => ({
		...list,
		items_count: Array.isArray(list.items) ? list.items[0]?.count || 0 : 0,
	}))

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/shopping-lists', label: 'Back to Shopping Lists' }}
				title={group?.name || 'Base Lists'}
				desc='Manage your base shopping lists'
			/>

			<PageContainer>
				{error && (
					<div
						role='alert'
						className='rounded-xl bg-destructive/10 p-4 text-sm text-destructive'
					>
						Error loading lists: {error}
					</div>
				)}

				<BaseListsList
					groupId={groupId}
					groupName={group?.name || 'this group'}
					baseLists={baseListsWithCount}
					activeBaseListId={activeSession?.base_list_id}
				/>
			</PageContainer>
		</>
	)
}
