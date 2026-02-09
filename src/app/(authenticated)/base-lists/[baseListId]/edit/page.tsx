import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { createClient } from '@/lib/supabase/server'

import ScrollArea from '@/components/ui/scroll-area'
import { BaseListItemRow, StartShoppingDialog } from '@/components/features/base-lists'
import { AddItemDialogBaseList, PageHeader, PageContainer, PageFooterAction, BackLink } from '@/components/app'
import type { BaseListWithItems } from '@/features/base-lists/types'

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

	// Parallelize group info and session queries
	const [groupResult, activeSessionResult, anyActiveSessionResult] = await Promise.all([
		supabase.from('groups').select('id, name').eq('id', baseListWithItems.group_id).single(),
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

	const { data: group } = groupResult
	const { data: activeSession } = activeSessionResult
	const { data: anyActiveSession } = anyActiveSessionResult

	// --- FLEX LAYOUT FOR HEADER/FOOTER/SCROLLABLE CONTENT ---
	return (
		<div className='flex flex-col h-dvh'>
			{/* Header (fixed by layout) */}
			<PageHeader
				title={baseListWithItems.name}
				desc='Manage items in this base list'
			>
				<div className='justify-end hidden md:flex'>
					<div className='w-fit flex gap-4'>
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
				</div>
			</PageHeader>
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
				<div className='w-full md:hidden'>
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
				</div>
			</PageFooterAction>
		</div>
	)
}
