import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBaseList } from '@/actions/base-lists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { AddItemForm } from '@/components/features/base-lists/add-item-form'
import { BaseListItemRow } from '@/components/features/base-lists/base-list-item-row'
import type { BaseListWithItems } from '@/features/base-lists/types'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'

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
				<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
					{error || 'Base list not found'}
				</div>
			</div>
		)
	}

	const baseListWithItems = baseList as BaseListWithItems

	// Get group info for breadcrumb
	const { data: group } = await supabase.from('groups').select('id, name').eq('id', baseListWithItems.group_id).single()

	// Check if this base list is being used in an active shopping run
	const { data: activeRun } = await supabase
		.from('shopping_runs')
		.select('id, name')
		.eq('user_id', user.id)
		.eq('base_list_id', baseListId)
		.eq('status', 'active')
		.maybeSingle()

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title={baseListWithItems.name}
				desc='Manage items in this base list'
				children={
					!activeRun && (
						<Button asChild>
							<Link href={`/shopping/new?baseListId=${baseListId}`}>
								<HugeiconsIcon
									icon={ShoppingBasket01Icon}
									strokeWidth={2}
									data-icon='inline-start'
								/>
								Start Shopping Run
							</Link>
						</Button>
					)
				}
			/>
			<div className='container mx-auto max-w-4xl space-y-6 p-6'>
				{activeRun && (
					<div className='rounded-lg border-2 border-green-500 bg-green-50 p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-semibold text-green-900'>Active Shopping Run in Progress</p>
								<p className='text-xs text-green-700 mt-1'>
									This list cannot be edited while being used in an active shopping run.
								</p>
							</div>
							<Button
								size='sm'
								asChild
							>
								<Link href={`/shopping/${activeRun.id}`}>
									<HugeiconsIcon
										icon={ShoppingBasket01Icon}
										strokeWidth={2}
										data-icon='inline-start'
									/>
									Continue Shopping
								</Link>
							</Button>
						</div>
					</div>
				)}

				<div className='flex items-center justify-between'>
					<BackLink
						href={`/ticket-groups/${baseListWithItems.group_id}/lists`}
						label={`Back to ${group?.name || 'Group'}`}
					/>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Items</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<AddItemForm
							baseListId={baseListId}
							isLocked={!!activeRun}
						/>

						{!baseListWithItems.items || baseListWithItems.items.length === 0 ? (
							<div className='flex flex-col items-center justify-center py-12 text-center'>
								<p className='text-sm text-muted-foreground'>No items yet. Add your first item above.</p>
							</div>
						) : (
							<div className='space-y-2'>
								{baseListWithItems.items
									.sort((a, b) => a.sort_order - b.sort_order)
									.map(item => (
										<BaseListItemRow
											key={item.id}
											item={item}
											isLocked={!!activeRun}
										/>
									))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
