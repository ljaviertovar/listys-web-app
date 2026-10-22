import { redirect } from 'next/navigation'

import { ActiveShoppingBadge, PageContainer, PageHeader } from '@/components/app'
import { Badge } from '@/components/ui/badge'
import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'
import {
	STARTED_SESSION_PARAM,
	SessionProgressCard,
	ShoppingSessionActions,
	ShoppingSessionItems,
	ShoppingSessionRealtimeListener,
} from '@/components/features/shopping-sessions'

import { getShoppingSession } from '@/actions'

import { createClient } from '@/lib/supabase/server'

import type { ShoppingSessionWithItems } from '@/types'

type SearchParams = {
	from?: string | string[]
	groupId?: string | string[]
	started?: string | string[]
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
	// Only the visit that follows starting the session; the items clear it from the URL once shown.
	const justStarted = [resolvedSearchParams[STARTED_SESSION_PARAM]].flat()[0] === '1'
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
	const groupId = runWithItems.base_list?.group_id

	const { data: group } = groupId ? await supabase.from('groups').select('name').eq('id', groupId).single() : { data: null }

	let backHref = '/shopping-history'
	let backLabel = 'Back to Shopping History'

	if (origin === 'history-group' && originGroupId) {
		backHref = `/shopping-history/${originGroupId}`
		backLabel = 'Back to Group History'
	} else if (groupId) {
		backHref = `/shopping-lists/${groupId}/lists`
		backLabel = `Back to ${group?.name || 'Group Lists'}`
	}

	// A finished session only shows what was bought.
	const items = isCompleted ? runWithItems.items.filter(item => item.checked === true) : runWithItems.items
	const checkedCount = runWithItems.items.filter(item => item.checked).length
	const totalCount = runWithItems.items.length

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: backHref, label: backLabel }}
				title={runWithItems.name}
				desc={
					isCompleted ? (
						<Badge variant='completed'>
							Completed
						</Badge>
					) : (
						<ActiveShoppingBadge />
					)
				}
			>
				{isCompleted ? null : (
					<ShoppingSessionActions
						sessionId={runId}
						checked={checkedCount}
						total={totalCount}
						isOwner={isListOwner}
					/>
				)}
			</PageHeader>

			<PageContainer className='pb-[calc(7rem+max(1.125rem,env(safe-area-inset-bottom)))] lg:pb-20'>
				<div className='flex w-full max-w-3xl flex-col gap-6'>
					{totalCount > 0 && (
						<SessionProgressCard
							checked={checkedCount}
							total={totalCount}
							isCompleted={isCompleted}
						/>
					)}

					{isCompleted ? null : (
						<div
							data-testid='session-toolbar'
							className='grid grid-cols-2 gap-2 md:flex md:justify-end'
						>
							{baseListId && isListOwner && (
								<ShareListDialog
									baseListId={baseListId}
									listName={baseListName}
									isOwner={isListOwner}
									className='w-full md:w-auto'
								/>
							)}
							<AddItemSheet
								target={{ context: 'shopping-session', sessionId: runId }}
								className={baseListId && isListOwner ? 'w-full md:w-auto' : 'col-span-2 w-full md:col-auto md:w-auto'}
							/>
						</div>
					)}

					<ShoppingSessionItems
						items={items}
						isCompleted={isCompleted}
						startCollapsed={justStarted && !isCompleted}
					/>
				</div>
			</PageContainer>

			{!isCompleted && <ShoppingSessionRealtimeListener sessionId={runId} />}
		</>
	)
}
