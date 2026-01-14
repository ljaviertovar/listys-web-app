import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBaseList } from '@/actions/base-lists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, ArrowLeft02Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { AddItemForm } from '@/components/features/base-lists/add-item-form'
import { BaseListItemRow } from '@/components/features/base-lists/base-list-item-row'
import type { BaseListWithItems } from '@/features/base-lists/types'

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

	return (
		<div className='container mx-auto max-w-4xl space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Link
						href={`/groups/${baseListWithItems.group_id}/lists`}
						className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
					>
						<HugeiconsIcon
							icon={ArrowLeft02Icon}
							strokeWidth={2}
							className='h-4 w-4'
						/>
						Back to {group?.name || 'Group'}
					</Link>
					<h1 className='text-3xl font-bold'>{baseListWithItems.name}</h1>
					<p className='text-muted-foreground'>Manage items in this base list</p>
				</div>
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
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Items</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<AddItemForm baseListId={baseListId} />

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
									/>
								))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
