import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageHeader, PageContainer, PageFooterAction, BackLink, ActiveShoppingBadge } from '@/components/app'
import { ShoppingSessionItemRow, ShoppingSessionActions } from '@/components/features/shopping-sessions'

import { CheckmarkCircle02Icon, PlusSignIcon } from '@hugeicons/core-free-icons'

import { getShoppingSession } from '@/actions/shopping-sessions'
import { getCategoryWithEmoji, normalizeCategory } from '@/data/constants'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils/format-date'

import type { ShoppingSessionItem, ShoppingSessionWithItems } from '@/features/shopping-sessions/types'

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

	const runWithItems = shoppingSession as ShoppingSessionWithItems & {
		base_list?: { group_id?: string | null; name?: string | null; user_id?: string | null } | null
	}
	const isCompleted = runWithItems.status === 'completed'

	const baseListId = runWithItems.base_list_id
	const baseListName = runWithItems.base_list?.name ?? runWithItems.name
	const isListOwner = runWithItems.base_list?.user_id === user.id

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

	const groupedItems = sortedItems.reduce(
		(acc, item) => {
			const normalizedCategory = normalizeCategory(item.category || '')
			const key = normalizedCategory || 'Other'

			if (!acc[key]) {
				acc[key] = []
			}

			acc[key].push(item)
			return acc
		},
		{} as Record<string, ShoppingSessionItem[]>,
	)

	const categorySections = Object.entries(groupedItems)
		.sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB, 'en', { sensitivity: 'base' }))
		.map(([category, groupedCategoryItems]) => ({
			key: category,
			title: getCategoryWithEmoji(category),
			items: groupedCategoryItems,
			checkedCount: groupedCategoryItems.filter(item => item.checked).length,
		}))
	const categoryHeaderThemes = [
		'border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5',
		'border-emerald-200/60 bg-gradient-to-r from-emerald-100/80 to-emerald-50/80 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-emerald-900/20',
		'border-amber-200/60 bg-gradient-to-r from-amber-100/80 to-amber-50/80 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-amber-900/20',
		'border-sky-200/60 bg-gradient-to-r from-sky-100/80 to-sky-50/80 dark:border-sky-900/50 dark:from-sky-950/40 dark:to-sky-900/20',
	]

	const checkedCount = runWithItems.items.filter(item => item.checked).length
	const totalCount = runWithItems.items.length
	const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

	return (
		<div className='flex h-dvh flex-col'>
			<PageHeader
				title={runWithItems.name}
				desc=''
			>
				<div className='w-full px-3 pb-3 -mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6'>
					{totalCount > 0 && (
						<div className='w-full flex gap-3 justify-between items-center md:min-w-0 md:flex-1'>
							<div className='flex flex-col gap-3'>
								<div className='flex items-end justify-between text-sm'>
									<p className='font-medium text-muted-foreground'>
										Progress:{' '}
										<span className='font-bold text-foreground tabular-nums'>
											{checkedCount} of {totalCount} items
										</span>{' '}
										collected
									</p>
									<span className='ml-2 text-xl font-bold tabular-nums text-primary leading-none'>{progress}%</span>
								</div>
								<Progress
									value={progress}
									className='h-2'
								/>
							</div>
							{!isCompleted && <ActiveShoppingBadge />}
						</div>
					)}

					{!isCompleted && (
						<div className='hidden w-full md:ml-auto md:block md:max-w-90 lg:max-w-105'>
							<ShoppingSessionActions
								sessionId={runId}
								progress={progress}
								baseListId={baseListId}
								baseListName={baseListName}
								isOwner={isListOwner}
							/>
						</div>
					)}
				</div>
			</PageHeader>

			<div className='flex flex-1 min-h-0 flex-col'>
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
						{sortedItems.length === 0 ? (
							<div className='flex flex-col items-center justify-center py-12 text-center'>
								<HugeiconsIcon
									icon={PlusSignIcon}
									strokeWidth={1.5}
									className='mb-4 h-10 w-10 text-muted-foreground'
								/>
								<h3 className='text-lg font-medium'>{isCompleted ? 'No purchased items' : 'No items yet'}</h3>
								<p className='mt-1 text-sm text-muted-foreground'>
									{isCompleted
										? 'No items were marked as purchased in this shopping run.'
										: 'Add items to continue this shopping session.'}
								</p>
							</div>
						) : (
							<div className='w-full max-w-2xl m-auto space-y-4 pb-32'>
								{categorySections.map(section => (
									<section
										key={section.key}
										className='mb-8'
									>
										<div className='mb-2 flex items-center justify-between'>
											<div className='min-w-0 flex-1'>
												<p className='text-base font-bold tracking-tight uppercase'>{section.title}</p>
												<div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums text-[10px] font-bold tracking-tighter text-muted-foreground/70'>
													<span>
														{section.items.length} {section.items.length === 1 ? 'Item' : 'Items'}
													</span>
													<span className='hidden h-1 w-1 rounded-full bg-border sm:inline-block' />
													<span>
														{section.checkedCount}/{section.items.length} Checked
													</span>
												</div>
											</div>
										</div>

										<div className='grid gap-2'>
											{section.items.map(item => (
												<ShoppingSessionItemRow
													key={item.id}
													item={item}
													isCompleted={isCompleted}
												/>
											))}
										</div>
									</section>
								))}
							</div>
						)}
					</ScrollArea>
				</PageContainer>
			</div>

			<PageFooterAction>
				<div className='w-full md:hidden'>
					{!isCompleted && (
						<ShoppingSessionActions
							sessionId={runId}
							progress={progress}
							baseListId={baseListId}
							baseListName={baseListName}
							isOwner={isListOwner}
						/>
					)}
				</div>
			</PageFooterAction>
		</div>
	)
}
