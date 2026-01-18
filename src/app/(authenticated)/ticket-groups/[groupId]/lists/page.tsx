import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBaseListsByGroup } from '@/actions/base-lists'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, AddToListIcon, ShoppingBasket01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { CreateBaseListDialog } from '@/components/features/base-lists/create-base-list-dialog'
import { BaseListCard } from '@/components/features/base-lists/base-list-card'
import type { BaseListWithCount } from '@/features/base-lists/types'
import PageHeader from '@/components/app/page-header'

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
		.select('id')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.maybeSingle()

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title={group?.name || 'Base Lists'}
				desc='Manage your base shopping lists'
			>
				<CreateBaseListDialog groupId={groupId} />
			</PageHeader>
			<div className='container mx-auto max-w-7xl space-y-6 p-6'>
				<Link
					href='/ticket-groups'
					className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Back to Groups
				</Link>

				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading lists: {error}</div>
				)}

				{!baseLists || baseLists.length === 0 ? (
					<Card className='flex min-h-[400px] flex-col items-center justify-center'>
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
						{baseListsWithCount.map(baseList => (
							<BaseListCard
								key={baseList.id}
								baseList={baseList}
								hasActiveRun={!!activeRun}
							/>
						))}
					</div>
				)}
			</div>
		</main>
	)
}
