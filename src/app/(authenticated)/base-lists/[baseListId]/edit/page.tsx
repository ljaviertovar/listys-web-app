import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { getBaseList } from '@/actions/base-lists'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { AddItemForm } from '@/components/features/base-lists/add-item-form'
import ScrollArea from '@/components/ui/scroll-area'
import { BaseListItemRow } from '@/components/features/base-lists/base-list-item-row'
import type { BaseListWithItems } from '@/features/base-lists/types'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'
import { PageContainer } from '@/components/app'

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

	// Check if user has any active shopping run
	const { data: anyActiveRun } = await supabase
		.from('shopping_runs')
		.select('id, base_list_id')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.maybeSingle()

	return (
		<>
			<PageHeader
				title={baseListWithItems.name}
				desc='Manage items in this base list'
				children={
					!anyActiveRun && (
						<Button asChild>
							<Link href={`/shopping/new?baseListId=${baseListId}`}>
								<HugeiconsIcon
									icon={ShoppingCart02Icon}
									strokeWidth={2}
									data-icon='inline-start'
								/>
								Start Shopping
							</Link>
						</Button>
					)
				}
			/>
			<PageContainer>
				<div className='flex items-center justify-between'>
					<BackLink
						href={`/shopping-lists/${baseListWithItems.group_id}/lists`}
						label={`Back to ${group?.name || 'Shopping Lists'}`}
					/>
				</div>

				<Card
					className='w-full max-w-3xl m-auto h-[60vh] flex flex-col'
					size='sm'
				>
					<CardHeader>
						<CardTitle>List Items</CardTitle>
					</CardHeader>
					<CardContent className='p-0 flex-1 min-h-0'>
						<ScrollArea className='h-full min-h-0 space-y-4 pr-2 pb-24'>
							{!baseListWithItems.items || baseListWithItems.items.length === 0 ? (
								<div className='flex flex-col items-center justify-center py-12 text-center'>
									<HugeiconsIcon
										icon={PlusSignIcon}
										strokeWidth={1.5}
										className='mb-4 h-10 w-10 text-muted-foreground'
									/>
									<h3 className='text-lg font-medium'>No items yet</h3>
									<p className='mt-1 text-sm text-muted-foreground'>
										Add your first item using the form below to start building this list.
									</p>
								</div>
							) : (
								<div className='space-y-2'>
									{baseListWithItems.items
										.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
										.map(item => (
											<BaseListItemRow
												key={item.id}
												item={item}
												isLocked={!!activeRun}
											/>
										))}
								</div>
							)}
						</ScrollArea>
					</CardContent>
					<CardFooter className='sticky bottom-0 z-10 bg-card/80 backdrop-blur border-t'>
						<AddItemForm
							baseListId={baseListId}
							isLocked={!!activeRun}
						/>
					</CardFooter>
				</Card>
			</PageContainer>
		</>
	)
}
