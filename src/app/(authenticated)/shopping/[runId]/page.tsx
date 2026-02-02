import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getShoppingRun } from '@/actions/shopping-runs'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { ShoppingRunItemRow } from '@/components/features/shopping-runs/shopping-run-item-row'
import { CompleteRunButton } from '@/components/features/shopping-runs/complete-run-button'
import { CompleteRunAlert } from '@/components/features/shopping-runs/complete-run-alert'
import { AddItemDialogBaseList } from '@/components/app/add-item-dialog-base-list'
import { CancelRunButton } from '@/components/features/shopping-runs/cancel-run-button'
import type { ShoppingRunWithItems } from '@/features/shopping-runs/types'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'
import { formatDate, formatTime } from '@/utils/format-date'
import PageContainer from '@/components/app/page-container'
import { PageFooterAction } from '@/components/app'
import { ScrollArea } from '@/components/ui/scroll-area'

export default async function ShoppingRunPage({ params }: { params: Promise<{ runId: string }> }) {
	const { runId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: shoppingRun, error } = await getShoppingRun(runId)

	if (error || !shoppingRun) {
		redirect('/dashboard')
	}

	const runWithItems = shoppingRun as ShoppingRunWithItems
	const isCompleted = runWithItems.status === 'completed'

	// Sort items: unchecked first, then by category and sort_order
	const sortedItems = [...runWithItems.items].sort((a, b) => {
		if (a.checked !== b.checked) return a.checked ? 1 : -1
		if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '')
		return (a.sort_order || 0) - (b.sort_order || 0)
	})

	const checkedCount = runWithItems.items.filter(item => item.checked).length
	const totalCount = runWithItems.items.length
	const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

	return (
		<>
			<PageHeader
				title={runWithItems.name}
				desc={
					isCompleted
						? `Completed on ${formatDate(new Date(runWithItems.completed_at!))} at ${formatTime(new Date(runWithItems.completed_at!))}`
						: `${checkedCount} of ${totalCount} items (${progress}%)`
				}
			/>

			<PageContainer>
				<BackLink
					href={isCompleted ? '/history' : '/dashboard'}
					label={isCompleted ? 'Back to History' : 'Back to Dashboard'}
				/>

				{isCompleted && (
					<div className='rounded-lg border border-green-200 bg-green-50 p-4'>
						<div className='flex items-start gap-3'>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								strokeWidth={2}
								className='h-5 w-5 text-green-600 mt-0.5 shrink-0'
							/>
							<div className='flex-1'>
								<p className='text-sm font-semibold text-green-900'>Shopping run completed</p>

								<p className='text-xs text-green-700 mt-1'>
									{isCompleted && `${checkedCount} of ${totalCount} items were purchased`}
								</p>
							</div>
						</div>
					</div>
				)}

				<ScrollArea className='h-full min-h-0 sm:px-6 touch-pan-y overscroll-contain'>
					<div className='space-y-2'>
						{sortedItems.map(item => (
							<ShoppingRunItemRow
								key={item.id}
								item={item}
								isCompleted={isCompleted}
							/>
						))}
					</div>
				</ScrollArea>
			</PageContainer>

			<PageFooterAction>
				<div className='w-full flex flex-col gap-2'>
					{!isCompleted && (
						<div className='w-full flex items-center gap-2'>
							<CancelRunButton runId={runId} />
							<CompleteRunButton
								runId={runId}
								progress={progress}
								items={runWithItems.items}
							/>
						</div>
					)}

					{!isCompleted && (
						<>
							<AddItemDialogBaseList
								context='shopping-run'
								runId={runId}
							/>
							<CompleteRunAlert
								title='🎉 All items checked!'
								description='You have checked all items in your shopping list. Would you like to complete this shopping run?'
								runId={runId}
								progress={progress}
							/>
						</>
					)}
				</div>
			</PageFooterAction>
		</>
	)
}
