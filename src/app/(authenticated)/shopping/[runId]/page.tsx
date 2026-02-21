import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader, PageContainer, PageFooterAction, BackLink, ActiveShoppingBadge } from '@/components/app'
import { ShoppingSessionItemRow, ShoppingSessionActions } from '@/components/features/shopping-sessions'

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { getShoppingSession } from '@/lib/api/endpoints/shopping-sessions'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils/format-date'

import type { ShoppingSessionWithItems } from '@/features/shopping-sessions/types'

type SearchParams = {
	from?: string | string[]
	groupId?: string | string[]
}

export default async function ShoppingRunPage({
	params,
	searchParams,
}: {
	params: Promise<{ runId: string }>
	searchParams: Promise<SearchParams>
}) {
	const { runId } = await params
	const resolvedSearchParams = await searchParams
	const origin = Array.isArray(resolvedSearchParams.from) ? resolvedSearchParams.from[0] : resolvedSearchParams.from
	const originGroupId = Array.isArray(resolvedSearchParams.groupId)
		? resolvedSearchParams.groupId[0]
		: resolvedSearchParams.groupId
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

	const runWithItems = shoppingSession as ShoppingSessionWithItems & { base_list?: { group_id?: string | null } | null }
	const isCompleted = runWithItems.status === 'completed'

	let backHref = '/shopping-history'
	let backLabel = 'Back to Shopping History'

	if (origin === 'history-group' && originGroupId) {
		backHref = `/shopping-history/${originGroupId}`
		backLabel = 'Back to Group History'
	} else if (runWithItems.base_list?.group_id) {
		backHref = `/shopping-lists/${runWithItems.base_list.group_id}/lists`
		backLabel = 'Back to Group Lists'
	}

	// If session is completed, only show checked items.
	// Otherwise show all items, pushing checked ones to the bottom.
	const items = isCompleted ? runWithItems.items.filter(item => item.checked === true) : runWithItems.items

	const sortedItems = [...items].sort((a, b) => {
		if (a.checked !== b.checked) return a.checked ? 1 : -1
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
				<div className='w-full px-3 pb-3 -mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6'>
					{totalCount > 0 && (
						<div className='w-full flex gap-3 items-center md:min-w-0 md:flex-1'>
							<Progress
								value={progress}
								className='h-2'
								indicatorClassName='bg-green-500'
							/>
							{!isCompleted && <ActiveShoppingBadge />}
						</div>
					)}

					{!isCompleted && (
						<div className='hidden w-full md:ml-auto md:block md:max-w-[360px] lg:max-w-[420px]'>
							<ShoppingSessionActions
								sessionId={runId}
								progress={progress}
							/>
						</div>
					)}
				</div>
			</PageHeader>

			<PageContainer>
				{isCompleted && (
					<BackLink
						href={backHref}
						label={backLabel}
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
					<div className='space-y-2 mb-4'>
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
