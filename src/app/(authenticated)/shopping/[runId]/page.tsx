import { redirect } from 'next/navigation'

import { ActiveShoppingBadge, PageContainer, PageHeader } from '@/components/app'
import { Badge } from '@/components/ui/badge'
import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'
import {
	STARTED_SESSION_PARAM,
	SessionEstimate,
	SessionProgressCard,
	ShoppingSessionActions,
	ShoppingSessionItems,
	ShoppingSessionRealtimeListener,
	buildSessionPriceEstimate,
	resolveSessionBackLink,
} from '@/components/features/shopping-sessions'

import { getShoppingSession } from '@/actions'

import { createClient } from '@/lib/supabase/server'

import type { ShoppingSessionWithItems } from '@/types'

type SearchParams = {
	from?: string | string[]
	list?: string | string[]
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
	const originListId = Array.isArray(resolvedSearchParams.list) ? resolvedSearchParams.list[0] : resolvedSearchParams.list
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
		base_list?: { name?: string | null; user_id?: string | null } | null
		store?: { id: string; name: string } | null
	}
	const isCompleted = runWithItems.status === 'completed'

	const baseListId = runWithItems.base_list_id
	const baseListName = runWithItems.base_list?.name ?? runWithItems.name
	const isListOwner = runWithItems.base_list?.user_id === user.id

	const { href: backHref, label: backLabel } = resolveSessionBackLink(origin, originListId)

	// The estimate only exists while the trip runs; a finished session shows what was bought, not a guess.
	// Read-only: it never writes a price. The list's own RLS decides what a collaborator can read.
	const { data: knownPrices } =
		!isCompleted && baseListId
			? await supabase.from('base_list_items').select('normalized_name, average_price').eq('base_list_id', baseListId)
			: { data: null }
	const priceEstimate = isCompleted ? null : buildSessionPriceEstimate(runWithItems.items, knownPrices ?? [])

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
						<div className='flex flex-wrap items-center gap-2'>
							<Badge variant='completed'>Completed</Badge>
							{runWithItems.store ? <Badge variant='neutral'>At {runWithItems.store.name}</Badge> : null}
						</div>
					) : (
						<div className='flex flex-wrap items-center gap-2'>
							<ActiveShoppingBadge />
							{runWithItems.store ? <Badge variant='neutral'>At {runWithItems.store.name}</Badge> : null}
						</div>
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

					{priceEstimate ? (
						<SessionEstimate
							total={priceEstimate.total}
							pricedCount={priceEstimate.pricedCount}
							itemCount={priceEstimate.itemCount}
						/>
					) : null}

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
						priceByItemId={priceEstimate ? Object.fromEntries(priceEstimate.priceByItemId) : undefined}
						startCollapsed={justStarted && !isCompleted}
						storeId={runWithItems.store_id}
						storeName={runWithItems.store?.name ?? null}
					/>
				</div>
			</PageContainer>

			{!isCompleted && <ShoppingSessionRealtimeListener sessionId={runId} />}
		</>
	)
}
