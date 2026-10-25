import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { PageContainer, PageHeader } from '@/components/app'
import { ListToolbar } from '@/components/commons'
import { BaseListItems, BaseListRealtimeListener, StartShoppingDialog } from '@/components/features/base-lists'
import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'

import { getBaseList } from '@/actions'

import type { BaseListWithItems } from '@/types'

export default async function EditBaseListPage({ params }: { params: Promise<{ baseListId: string }> }) {
	const { baseListId } = await params
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

	// Parallelize the session queries
	const [activeSessionResult, anyActiveSessionResult] = await Promise.all([
		supabase
			.from('shopping_sessions')
			.select('id, name')
			.eq('user_id', user.id)
			.eq('base_list_id', baseListId)
			.eq('status', 'active')
			.maybeSingle(),
		supabase
			.from('shopping_sessions')
			.select('id, base_list_id')
			.eq('user_id', user.id)
			.eq('status', 'active')
			.maybeSingle(),
	])

	// This list is being shopped: it is locked until the session ends.
	const isLocked = !!activeSessionResult.data
	// Only one session can run at a time, so any of them hides "Start Shopping".
	const hasActiveSession = !!anyActiveSessionResult.data

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
						sessionActive={hasActiveSession}
						className='sm:w-fit'
					/>

					<ListToolbar
						count={items.length}
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

					<BaseListItems
						baseListId={baseListId}
						items={items}
						isLocked={isLocked}
					/>
				</div>
			</PageContainer>

			<BaseListRealtimeListener baseListId={baseListId} />
		</>
	)
}
