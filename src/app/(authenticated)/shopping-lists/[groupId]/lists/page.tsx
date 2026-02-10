import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent } from '@/components/ui/card'
import { CreateBaseListDialog, BaseListCard } from '@/components/features/base-lists'
import { AddToListIcon, SearchList01FreeIcons, SearchList01Icon } from '@hugeicons/core-free-icons'

import { PageHeader, PageContainer, PageFooterAction, BackLink, ActiveShopping } from '@/components/app'

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
	const baseListsWithCount: BaseListWithCount[] = baseLists
		? baseLists.map(list => ({
				...list,
				items_count: Array.isArray(list.items) ? list.items[0]?.count || 0 : 0,
			}))
		: []

	return (
		<>
			<PageHeader
				title={group?.name || 'Base Lists'}
				desc='Manage your base shopping lists'
			>
				<div className='justify-end hidden md:flex	'>
					<div className='w-fit'>
						<CreateBaseListDialog groupId={groupId} />
					</div>
				</div>
			</PageHeader>

			<PageContainer>
				<BackLink
					href='/shopping-lists'
					label='Back to Shopping Lists'
				/>

				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading lists: {error}</div>
				)}

				{activeSession && <ActiveShopping />}

				{!baseLists || baseLists.length === 0 ? (
					<Card
						className='flex min-h-100 flex-col items-center justify-center'
						size='sm'
					>
						<CardContent className='flex w-full max-w-md flex-col items-center pt-6 text-center'>
							<div className='flex h-16 w-16 items-center justify-center text-primary'>
								<HugeiconsIcon
									icon={SearchList01Icon}
									strokeWidth={2}
									className='h-12 w-12'
								/>
							</div>
							<div className='mt-1'>
								<h3 className='text-xl font-semibold tracking-tight'>No base lists yet</h3>
								<p className='mt-1 text-sm text-muted-foreground'>Create your first base list with common items.</p>
							</div>
							<div className='mt-6 w-full max-w-[260px]'>
								<CreateBaseListDialog groupId={groupId} />
							</div>
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{baseListsWithCount
							.sort((a, b) => {
								// Active session first
								const aIsActive = activeSession?.base_list_id === a.id
								const bIsActive = activeSession?.base_list_id === b.id
								if (aIsActive && !bIsActive) return -1
								if (!aIsActive && bIsActive) return 1
								return 0
							})
							.map(baseList => (
								<BaseListCard
									key={baseList.id}
									baseList={baseList}
									hasActiveRun={!!activeSession}
									isActiveRun={activeSession?.base_list_id === baseList.id}
									activeRunId={activeSession?.id}
								/>
							))}
					</div>
				)}
			</PageContainer>

			<PageFooterAction>
				<div className='w-full md:hidden'>
					<CreateBaseListDialog groupId={groupId} />
				</div>
			</PageFooterAction>
		</>
	)
}
