import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, PageContainer, PageFooterAction, BackLink } from '@/components/app'
import { ShoppingSessionItemRow } from '@/components/features/shopping-sessions/shopping-session-item-row'
import { ShoppingSessionActions } from '@/components/features/shopping-sessions/shopping-session-actions'
import { ActiveShoppingBadge } from '@/components/app/active-shopping-badge'

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { getShoppingSession } from '@/actions/shopping-sessions'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils/format-date'

import type { ShoppingSessionWithItems } from '@/features/shopping-sessions/types'

export default async function ShoppingRunPage({ params }: { params: Promise<{ runId: string }> }) {
	const { runId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: shoppingSession, error } = await getShoppingSession(runId)

	if (error || !shoppingSession) {
		redirect('/dashboard')
	}

	const runWithItems = shoppingSession as ShoppingSessionWithItems
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
			>
				{totalCount > 0 && (
					<div className='w-full px-3 pb-3 flex gap-3 items-center -mt-2'>
						<Progress
							value={progress}
							className='h-2'
						/>
						{!isCompleted && <ActiveShoppingBadge />}
					</div>
				)}
				<div className='justify-end hidden md:flex'>
					<div className='w-fit'>
						{!isCompleted && (
							<ShoppingSessionActions
								sessionId={runId}
								progress={progress}
							/>
						)}
					</div>
				</div>
			</PageHeader>

			<PageContainer>
				{isCompleted && (
					<BackLink
						href='/shopping-history'
						label='Back to Shopping History'
					/>
				)}

				{isCompleted && (
					<div className='rounded-lg border border-green-200 bg-green-50 p-4'>
						<div className='flex items-start gap-3'>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								strokeWidth={2}
								className='h-5 w-5 text-green-600 mt-0.5 shrink-0'
							/>
							<div className='flex-1'>
								<p className='text-sm font-semibold text-green-900'>Shopping completed</p>

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
							<ShoppingSessionItemRow
								key={item.id}
								item={item}
								isCompleted={isCompleted}
							/>
						))}
					</div>
				</ScrollArea>
			</PageContainer>

			<PageFooterAction>
				<div className='w-full md:hidden'>
					<div className='w-full flex flex-col gap-2'>
						{!isCompleted && (
							<ShoppingSessionActions
								sessionId={runId}
								progress={progress}
							/>
						)}
					</div>
				</div>
			</PageFooterAction>
		</>
	)
}
