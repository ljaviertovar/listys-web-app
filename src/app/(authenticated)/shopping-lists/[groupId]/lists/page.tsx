import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent } from '@/components/ui/card'
import { CreateBaseListDialog } from '@/components/features/base-lists/create-base-list-dialog'
import { AddToListIcon } from '@hugeicons/core-free-icons'

import { PageHeader, PageContainer, PageFooterAction } from '@/components/app'
import { BaseListCard } from '@/components/features/base-lists/base-list-card'
import BackLink from '@/components/app/back-link'
import ActiveShopping from '@/components/app/active-shopping'

import { getBaseListsByGroup } from '@/actions/base-lists'

import type { BaseListWithCount } from '@/features/base-lists/types'

export default async function BaseListsPage({ params }: { params: Promise<{ groupId: string }> }) {
	const { groupId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: baseLists, error } = await getBaseListsByGroup(groupId)

	// Transform Supabase count result to our type
	const baseListsWithCount: BaseListWithCount[] = baseLists
		? baseLists.map(list => ({
				...list,
				items_count: Array.isArray(list.items) ? list.items[0]?.count || 0 : 0,
			}))
		: []

	// Get group name
	const { data: group } = await supabase.from('groups').select('name').eq('id', groupId).single()

	// Check if there's an active shopping run
	const { data: activeRun } = await supabase
		.from('shopping_runs')
		.select('id, base_list_id')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.maybeSingle()

	return (
		<>
			<PageHeader
				title={group?.name || 'Base Lists'}
				desc='Manage your base shopping lists'
			/>

			<PageContainer>
				<BackLink
					href='/shopping-lists'
					label='Back to Shopping Lists'
				/>

				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading lists: {error}</div>
				)}

				{activeRun && <ActiveShopping />}

				{!baseLists || baseLists.length === 0 ? (
					<Card
						className='flex min-h-100 flex-col items-center justify-center'
						size='sm'
					>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={AddToListIcon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No base lists yet</h3>
								<p className='text-sm text-muted-foreground'>Create your first base list with common items</p>
							</div>
							<CreateBaseListDialog groupId={groupId} />
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{baseListsWithCount
							.sort((a, b) => {
								// Active run first
								const aIsActive = activeRun?.base_list_id === a.id
								const bIsActive = activeRun?.base_list_id === b.id
								if (aIsActive && !bIsActive) return -1
								if (!aIsActive && bIsActive) return 1
								return 0
							})
							.map(baseList => (
								<BaseListCard
									key={baseList.id}
									baseList={baseList}
									hasActiveRun={!!activeRun}
									isActiveRun={activeRun?.base_list_id === baseList.id}
									activeRunId={activeRun?.id}
								/>
							))}
					</div>
				)}
			</PageContainer>

			<PageFooterAction>
				<CreateBaseListDialog groupId={groupId} />
			</PageFooterAction>
		</>
	)
}
