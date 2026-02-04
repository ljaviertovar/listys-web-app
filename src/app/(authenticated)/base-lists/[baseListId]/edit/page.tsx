import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { createClient } from '@/lib/supabase/server'

import ScrollArea from '@/components/ui/scroll-area'
import { BaseListItemRow } from '@/components/features/base-lists/base-list-item-row'
import { AddItemDialogBaseList } from '@/components/app/add-item-dialog-base-list'
import { StartShoppingDialog } from '@/components/features/base-lists/start-shopping-dialog'
import type { BaseListWithItems } from '@/features/base-lists/types'
import { PageHeader, PageContainer, PageFooterAction, BackLink } from '@/components/app'

import { getBaseList } from '@/actions/base-lists'

import { PlusSignIcon } from '@hugeicons/core-free-icons'

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
	const totalItems = baseListWithItems.items ? baseListWithItems.items.length : 0
	// Get group info for breadcrumb
	const { data: group } = await supabase.from('groups').select('id, name').eq('id', baseListWithItems.group_id).single()
	// Check if this base list is being used in an active shopping session
	const { data: activeSession } = await supabase
		.from('shopping_sessions')
		.select('id, name')
		.eq('user_id', user.id)
		.eq('base_list_id', baseListId)
		.eq('status', 'active')
		.maybeSingle()
	// Check if user has any active shopping session
	const { data: anyActiveSession } = await supabase
		.from('shopping_sessions')
		.select('id, base_list_id')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.maybeSingle()

	// --- FLEX LAYOUT FOR HEADER/FOOTER/SCROLLABLE CONTENT ---
	return (
		<div className='flex flex-col h-dvh'>
			{/* Header (fixed by layout) */}
			<PageHeader
				title={baseListWithItems.name}
				desc='Manage items in this base list'
			/>
			{/* Main scrollable area */}
			<div className='flex-1 min-h-0 flex flex-col'>
				<PageContainer>
					<div className='w-full flex justify-between mb-0'>
						<BackLink
							href={`/shopping-lists/${baseListWithItems.group_id}/lists`}
							label={`Back to ${group?.name || 'Shopping Lists'}`}
						/>

						<span className='text-primary font-medium'>{totalItems} Items</span>
					</div>
					<ScrollArea className='h-full min-h-0 sm:px-6 touch-pan-y overscroll-contain'>
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
											isLocked={!!activeSession}
										/>
									))}
							</div>
						)}
					</ScrollArea>
				</PageContainer>
			</div>

			<PageFooterAction>
				<div className='w-full flex gap-4'>
					<AddItemDialogBaseList
						context='base-list'
						baseListId={baseListId}
						isLocked={!!activeSession}
					/>
					{!anyActiveSession && baseListWithItems.items.length > 0 && (
						<StartShoppingDialog
							baseListId={baseListId}
							baseListName={baseListWithItems.name}
							itemsCount={totalItems}
							disabled={!baseListWithItems.items || baseListWithItems.items.length === 0}
						/>
					)}
				</div>
			</PageFooterAction>
		</div>
	)
}
