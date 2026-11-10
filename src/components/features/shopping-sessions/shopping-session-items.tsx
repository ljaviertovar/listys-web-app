'use client'

import { useEffect, useMemo } from 'react'
import { TaskAdd01Icon } from '@hugeicons/core-free-icons'

import { CategoryCollapseControl, CategorySection, EmptyStateCard, useCategorySectionExpansion } from '@/components/commons'
import { groupByCategory } from '@/utils'
import type { ShoppingSessionItem } from '@/types'
import { Card } from '@/components/ui/card'
import type { CategoryGroup } from '@/utils/group-by-category'

import { STARTED_SESSION_PARAM } from './helpers/started-session'
import { splitSessionSections } from './helpers/split-session-sections'
import { ShoppingSessionItemRow, type TripItemStoreInfo } from './shopping-session-item-row'
import { useTripSync } from './hooks/use-trip-sync'
import { visibleTripItems } from './sync/trip-sync-state'

interface ShoppingSessionItemsProps {
	sessionId?: string
	items: ShoppingSessionItem[]
	isCompleted?: boolean
	/** Average price of each item the list knows a price for, by session item id; a finished session passes none. */
	priceByItemId?: Record<string, number>
	storeInfoByItemId?: Record<string, TripItemStoreInfo>
	/** Fold every category: only the first visit after the session is started. Later renders keep what the user opened or closed. */
	startCollapsed?: boolean
	storeId?: string | null
	storeName?: string | null
}

/** Unticked items first inside a category, so what is left to buy stays at the top; each group keeps the list's own order. */
function sortForShopping(items: ShoppingSessionItem[]) {
	return [...items].sort((a, b) => {
		if (a.checked !== b.checked) return a.checked ? 1 : -1
		return (a.sort_order || 0) - (b.sort_order || 0)
	})
}

/** The items of a session in one card, a collapsible category each with how many are in the cart ("1/2"). */
export function ShoppingSessionItems({ items: initialItems, sessionId, isCompleted = false, priceByItemId, storeInfoByItemId, startCollapsed = false, storeId = null, storeName }: ShoppingSessionItemsProps) {
	const { state } = useTripSync(isCompleted ? null : sessionId ?? initialItems[0]?.shopping_session_id)
	const items = useMemo(() => !isCompleted && state.initialized ? visibleTripItems(state) : initialItems, [state, initialItems, isCompleted])
	const groups = useMemo(() => groupByCategory(sortForShopping(items)), [items])
	const sections = useMemo(() => splitSessionSections(sortForShopping(items)), [items])
	const storeGroups = useMemo(() => groupByCategory(sections.storeItems), [sections.storeItems])
	const otherGroups = useMemo(() => groupByCategory(sections.otherItems), [sections.otherItems])
	const sectionDescriptors = storeId
		? [
			...storeGroups.map(group => ({ id: `session-store-category-${group.key}`, defaultOpen: !startCollapsed })),
			{ id: 'session-other-stores-section', defaultOpen: sections.storeItems.length === 0 },
			...otherGroups.map(group => ({ id: `session-other-category-${group.key}`, defaultOpen: !startCollapsed })),
		]
		: groups.map(group => ({ id: `session-category-${group.key}`, defaultOpen: !startCollapsed }))
	const expansion = useCategorySectionExpansion(sectionDescriptors)

	// The flag only describes this first visit: dropping it from the URL (no navigation) makes a reload or a later visit open the categories.
	useEffect(() => {
		if (!startCollapsed) return
		const url = new URL(window.location.href)
		url.searchParams.delete(STARTED_SESSION_PARAM)
		window.history.replaceState(window.history.state, '', url)
	}, [startCollapsed])

	if (items.length === 0) {
		return (
			<EmptyStateCard
				icon={TaskAdd01Icon}
				tone='amber'
				title={isCompleted ? 'No purchased items' : 'No items yet'}
				description={
					isCompleted
						? 'No items were marked as purchased in this shopping session.'
						: 'Add items to continue this shopping session.'
				}
				testId='session-empty-state'
			/>
		)
	}

	return (
		<Card
			size='list'
			aria-label='Items by category'
			data-testid='session-items-card'
		>
			<CategoryCollapseControl
				allCollapsed={expansion.allCollapsed}
				onToggle={expansion.toggleAll}
				testId='session-category-collapse-control'
			/>
			{storeId ? (
				<>
					<section aria-label={storeName ? `At ${storeName}` : 'At this store'} data-testid='session-current-store-section'>
						<h2 className='px-0.5 pt-0.5 pb-1 text-sm font-semibold text-foreground'>{storeName ? `At ${storeName}` : 'At this store'}</h2>
						<SessionCategoryGroups
							groups={storeGroups}
							isCompleted={isCompleted}
							priceByItemId={priceByItemId}
							storeInfoByItemId={storeInfoByItemId}
							purchaseStore={storeId && storeName ? { id: storeId, name: storeName } : null}
							defaultOpen={!startCollapsed}
							expansion={expansion}
							prefix='session-store-category'
						/>
					</section>
					<CategorySection
						category='other-stores'
						title='Other Stores and Untagged'
						count={String(sections.otherItems.length)}
						open={expansion.isOpen('session-other-stores-section', sections.storeItems.length === 0)}
						onOpenChange={open => expansion.onOpenChange('session-other-stores-section', open)}
						testId='session-other-stores-section'
					>
						<SessionCategoryGroups
							groups={otherGroups}
							isCompleted={isCompleted}
							priceByItemId={priceByItemId}
							storeInfoByItemId={storeInfoByItemId}
							defaultOpen={!startCollapsed}
							expansion={expansion}
							prefix='session-other-category'
						/>
					</CategorySection>
				</>
			) : (
				<SessionCategoryGroups
					groups={groups}
					isCompleted={isCompleted}
					priceByItemId={priceByItemId}
					storeInfoByItemId={storeInfoByItemId}
					defaultOpen={!startCollapsed}
					expansion={expansion}
					prefix='session-category'
				/>
			)}
		</Card>
	)
}

interface SessionCategoryGroupsProps {
	groups: CategoryGroup<ShoppingSessionItem>[]
	isCompleted: boolean
	priceByItemId?: Record<string, number>
	storeInfoByItemId?: Record<string, TripItemStoreInfo>
	purchaseStore?: { id: string; name: string } | null
	defaultOpen: boolean
	prefix: string
	expansion: Pick<ReturnType<typeof useCategorySectionExpansion>, 'isOpen' | 'onOpenChange'>
}

function SessionCategoryGroups({ groups, isCompleted, priceByItemId, storeInfoByItemId, purchaseStore, defaultOpen, prefix, expansion }: SessionCategoryGroupsProps) {
	return groups.map((group, index) => {
		const done = group.items.filter(item => item.checked).length
		const id = `${prefix}-${group.key}`

		return (
			<CategorySection
				key={group.key}
				category={group.key}
				title={group.title}
				count={isCompleted ? String(group.items.length) : `${done}/${group.items.length}`}
				complete={done === group.items.length}
				open={expansion.isOpen(id, defaultOpen)}
				onOpenChange={open => expansion.onOpenChange(id, open)}
				className={index === 0 ? 'border-t-0' : undefined}
				testId={id}
			>
				<ul className='divide-y divide-slate-200/70 dark:divide-border'>
					{group.items.map(item => (
						<li key={item.id}>
							<ShoppingSessionItemRow item={item} isCompleted={isCompleted} averagePrice={priceByItemId?.[item.id]} storeInfo={storeInfoByItemId?.[item.id]} purchaseStore={purchaseStore} />
						</li>
					))}
				</ul>
			</CategorySection>
		)
	})
}
