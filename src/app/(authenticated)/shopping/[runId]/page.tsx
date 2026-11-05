import { getItemPurchaseStats } from '@/components/features/base-lists/items/helpers/item-purchase-stats'
import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Attachment01Icon } from '@hugeicons/core-free-icons'

import { ActiveShoppingBadge, PageContainer, PageHeader } from '@/components/app'
import { Badge } from '@/components/ui/badge'
import { DataFigure, DataLine, EntityLabel } from '@/components/commons'
import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'
import { STARTED_SESSION_PARAM, SessionEstimate, SessionProgressCard, TripReceiptsCard, TripReceiptSummary,
	getTripReceiptState, getTripStores, ShoppingSessionActions, ShoppingSessionItems, ShoppingSessionRealtimeListener,
	buildSessionPriceEstimate, resolveSessionBackLink } from '@/components/features/shopping-sessions'
import { getShoppingSession } from '@/actions'
import { buildItemStoreSummary } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { createClient } from '@/lib/supabase/server'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import type { ShoppingSessionWithItems, TripReceipt } from '@/types'
import { formatCurrency, formatTime, formatTripDate } from '@/utils'

type SearchParams = { from?: string | string[]; list?: string | string[]; started?: string | string[]; saved?: string | string[]; receipt?: string | string[] }

export default async function ShoppingRunPage({ params, searchParams }: { params: Promise<{ runId: string }>; searchParams: Promise<SearchParams> }) {
	const { runId } = await params
	const query = await searchParams
	const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
	const justStarted = first(query[STARTED_SESSION_PARAM]) === '1'
	const justSaved = first(query.saved) === '1'
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) redirect('/auth/signin')
	const { data: shoppingSession, error } = await getShoppingSession(runId)
	if (error || !shoppingSession) redirect('/dashboard')
	const run = shoppingSession as ShoppingSessionWithItems & {
		base_list?: { name?: string | null; user_id?: string | null } | null
		store?: { id: string; name: string } | null
		receipts?: TripReceipt[]
	}
	const receipts = run.receipts ?? []
	const isCompleted = run.status === 'completed'
	const baseListId = run.base_list_id
	const baseListName = run.base_list?.name ?? run.name
	const isListOwner = run.base_list?.user_id === user.id
	const ranTrip = run.user_id === user.id
	const { href: backHref, label: backLabel } = resolveSessionBackLink(first(query.from), first(query.list))
	const items = isCompleted ? run.items.filter(item => item.checked === true) : run.items
	const checkedCount = run.items.filter(item => item.checked).length
	const totalCount = run.items.length
	const trip: TicketSessionCandidate | undefined = ranTrip ? {
		id: runId, name: run.name, status: isCompleted ? 'completed' : 'active',
		started_at: run.started_at ?? null, completed_at: run.completed_at ?? null,
		store: run.store ?? null, base_list: { id: baseListId ?? '', name: baseListName },
		checked_count: checkedCount, item_count: totalCount,
	} : undefined
	// These reads only supply display data; opening the trip never learns prices or attaches anything.
	const [pricesResult, pendingResult] = await Promise.all([
		baseListId ? supabase.from('base_list_items').select('normalized_name, average_price, purchase_count, first_seen_at, last_purchased_at, usual_store_source, usual_store:stores!base_list_items_usual_store_id_fkey(id, name), store_stats:base_list_item_store_stats(store_id, purchase_count, last_purchased_at, last_price, last_price_at, last_quantity, last_unit, store:stores(id, name))').eq('base_list_id', baseListId) : Promise.resolve({ data: null }),
		ranTrip ? supabase.from('tickets').select('id, ocr_status, total_items, total_amount, store:stores(id, name)')
			.eq('user_id', user.id).eq('uploaded_from_session_id', runId).is('shopping_session_id', null).is('base_list_id', null)
			.order('created_at', { ascending: false }) : Promise.resolve({ data: null }),
	])
	const priceEstimate = buildSessionPriceEstimate(items, pricesResult.data ?? [])
	const storeInfoByName = new Map((pricesResult.data ?? []).map(item => [item.normalized_name,
		{ ...buildItemStoreSummary(item.store_stats, item.usual_store, item.usual_store_source), purchaseStats: getItemPurchaseStats({ purchase_count: item.purchase_count ?? 0, first_seen_at: item.first_seen_at, last_purchased_at: item.last_purchased_at }) }]))
	const storeInfoByItemId = Object.fromEntries(items.flatMap(item => {
		const info = storeInfoByName.get(item.normalized_name ?? '')
		return info ? [[item.id, info]] : []
	}))
	const pending = pendingResult.data ?? []
	const receiptState = getTripReceiptState({ receipts, pendingReceipt: pending[0] })
	const stores = getTripStores(run.store, receipts)
	const when = run.completed_at ?? run.started_at
	const date = when ? new Date(when) : null
	const amount = receipts.length && receipts.some(receipt => receipt.total_amount !== null)
		? receipts.reduce((sum, receipt) => sum + (receipt.total_amount ?? 0), 0) : run.total_amount ?? priceEstimate?.total
	const attachedEntries = receipts.map(receipt => ({ ...receipt, attached: true }))
	const activeEntries = [...pending.map(receipt => ({ id: receipt.id, attached: false, ocr_status: receipt.ocr_status,
		store: receipt.store, items_count: receipt.total_items ?? 0, total_amount: receipt.total_amount })), ...attachedEntries]
	if (justSaved && isCompleted && receipts.length === 0 && receiptState.kind === 'none') {
		return <PageContainer><div className='mx-auto w-full max-w-xl'><TripReceiptsCard state={receiptState} justSaved itemCount={checkedCount} listName={baseListName} trip={trip} /></div></PageContainer>
	}
	return <>
		<PageHeader variant='screen' back={{ href: backHref, label: backLabel }} title={run.name}
			aside={isCompleted ? <Badge variant='completed' dot>Completed</Badge> : undefined}
			desc={<div className='flex flex-col gap-2'>
				<div data-testid='trip-header-classification' className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5'>
					{!isCompleted ? <ActiveShoppingBadge /> : null}
					{stores.map(store => <EntityLabel key={store.id} name={store.name} testId={`trip-store-${store.id}`} />)}
					{isCompleted ? <Badge variant={receipts.length ? 'tag' : 'tag-attention'}><HugeiconsIcon icon={receipts.length ? Attachment01Icon : Alert02Icon} strokeWidth={1.8} aria-hidden='true' />{receipts.length > 1 ? `${receipts.length} receipts` : receipts.length ? 'Receipt attached' : 'No receipt'}</Badge> : null}
				</div>
				<DataLine testId='trip-header-data'>{date ? <DataFigure>{formatTripDate(date)}</DataFigure> : null}{date ? <DataFigure>{formatTime(date)}</DataFigure> : null}{amount == null ? null : <DataFigure>{formatCurrency(amount)}</DataFigure>}</DataLine>
			</div>}>
			{!isCompleted ? <ShoppingSessionActions sessionId={runId} checked={checkedCount} total={totalCount} isOwner={isListOwner} canUploadReceipt={ranTrip} /> : null}
		</PageHeader>
		<PageContainer className='pb-[calc(7rem+max(1.125rem,env(safe-area-inset-bottom)))] lg:pb-20'>
			<div className='flex w-full max-w-3xl flex-col gap-6'>
				{!isCompleted && totalCount > 0 ? <SessionProgressCard checked={checkedCount} total={totalCount} /> : null}
				{priceEstimate && (!isCompleted || !receipts.length) ? <SessionEstimate total={priceEstimate.total} pricedCount={priceEstimate.pricedCount} itemCount={priceEstimate.itemCount} completed={isCompleted} /> : null}
				{isCompleted && receiptState.kind !== 'attached' ? <TripReceiptsCard state={receiptState} itemCount={checkedCount} listName={baseListName} openAddOnLoad={first(query.receipt) === 'add'} trip={trip} /> : null}
				{isCompleted && receipts.length ? <TripReceiptSummary receipts={attachedEntries} active={false} itemCount={checkedCount} fallbackTotal={run.total_amount} estimate={priceEstimate?.pricedCount ? priceEstimate.total : undefined} trip={trip} /> : null}
				{!isCompleted && activeEntries.length ? <TripReceiptSummary receipts={activeEntries} active itemCount={checkedCount} trip={trip} /> : null}
				{!isCompleted ? <div data-testid='session-toolbar' className='grid grid-cols-2 gap-2 md:flex md:justify-end'>
					{baseListId && isListOwner ? <ShareListDialog baseListId={baseListId} listName={baseListName} isOwner={isListOwner} className='w-full md:w-auto' /> : null}
					<AddItemSheet target={{ context: 'shopping-session', sessionId: runId }} className={baseListId && isListOwner ? 'w-full md:w-auto' : 'col-span-2 w-full md:col-auto md:w-auto'} />
				</div> : null}
				<ShoppingSessionItems storeInfoByItemId={storeInfoByItemId} items={items} isCompleted={isCompleted} priceByItemId={!isCompleted && priceEstimate ? Object.fromEntries(priceEstimate.priceByItemId) : undefined} startCollapsed={justStarted && !isCompleted} storeId={run.store_id} storeName={run.store?.name ?? null} />
			</div>
		</PageContainer>
		{!isCompleted ? <ShoppingSessionRealtimeListener sessionId={runId} /> : null}
	</>
}
