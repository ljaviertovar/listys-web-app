'use client'

import { formatItemName } from '@/utils'
import type { ShoppingSessionItem } from '@/types'
import type { ItemStoreSummary } from '@/components/features/base-lists/items/helpers/item-store-summary'
import { formatAlsoAt } from '@/components/features/base-lists/items/helpers/item-store-summary'

import { useSessionItemActions } from './hooks/use-session-item-actions'
import { ShoppingSessionItemRowView } from './shopping-session-item-row-view'

export type TripItemStoreInfo = Pick<ItemStoreSummary, 'usual_store' | 'other_stores'> &
	Partial<Pick<ItemStoreSummary, 'store_prices' | 'store_history'>> & {
		purchaseStats?: { purchaseCount: number; intervalDays: number | null; lastBought: string | null }
	}

interface ShoppingSessionItemRowProps {
	item: ShoppingSessionItem
	isCompleted?: boolean
	averagePrice?: number | null
	storeInfo?: TripItemStoreInfo
	purchaseStore?: { id: string; name: string } | null
}

/**
 * Trip rows show what was bought; editing and item menus belong to the reusable list. This component connects a trip item to its
 * check action and store data; ShoppingSessionItemRowView draws it.
 */
export function ShoppingSessionItemRow({
	item,
	isCompleted = false,
	averagePrice,
	storeInfo,
	purchaseStore,
}: ShoppingSessionItemRowProps) {
	const { checked, toggling, toggle } = useSessionItemActions(item)
	const primaryStore = purchaseStore ?? storeInfo?.usual_store ?? null
	const alsoAt = formatAlsoAt((storeInfo?.other_stores ?? []).filter(store => store.id !== purchaseStore?.id))

	return (
		<ShoppingSessionItemRowView
			id={item.id}
			name={formatItemName(item.name)}
			quantity={item.quantity}
			unit={item.unit}
			notes={item.notes}
			isCompleted={isCompleted}
			checked={checked}
			onToggle={toggle}
			toggling={toggling}
			price={item.price}
			averagePrice={averagePrice}
			store={
				primaryStore
					? {
							name: primaryStore.name,
							manual: !purchaseStore && storeInfo?.usual_store?.source === 'manual',
							kind: purchaseStore ? 'purchase-store' : 'usual-store',
						}
					: null
			}
			alsoAt={alsoAt}
		/>
	)
}
