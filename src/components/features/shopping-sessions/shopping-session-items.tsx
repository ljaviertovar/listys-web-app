'use client'

import { useEffect, useMemo } from 'react'
import { TaskAdd01Icon } from '@hugeicons/core-free-icons'

import { CategorySection, EmptyStateCard } from '@/components/commons'
import { groupByCategory } from '@/utils'
import type { ShoppingSessionItem } from '@/types'
import type { CategoryGroup } from '@/utils/group-by-category'

import { STARTED_SESSION_PARAM } from './helpers/started-session'
import { splitSessionSections } from './helpers/split-session-sections'
import { ShoppingSessionItemRow } from './shopping-session-item-row'

interface ShoppingSessionItemsProps {
	items: ShoppingSessionItem[]
	isCompleted?: boolean
	/** Average price of each item the list knows a price for, by session item id; a finished session passes none. */
	priceByItemId?: Record<string, number>
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
export function ShoppingSessionItems({ items, isCompleted = false, priceByItemId, startCollapsed = false, storeId = null, storeName }: ShoppingSessionItemsProps) {
	const groups = useMemo(() => groupByCategory(sortForShopping(items)), [items])
	const sections = useMemo(() => splitSessionSections(sortForShopping(items)), [items])
	const storeGroups = useMemo(() => groupByCategory(sections.storeItems), [sections.storeItems])
	const otherGroups = useMemo(() => groupByCategory(sections.otherItems), [sections.otherItems])

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
		<section
			aria-label='Items by category'
			data-testid='session-items-card'
			className='rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			{storeId ? (
				<>
					<section aria-label={storeName ? `At ${storeName}` : 'At this store'} data-testid='session-current-store-section'>
						<h2 className='px-2 pb-2 text-sm font-semibold text-foreground'>{storeName ? `At ${storeName}` : 'At this store'}</h2>
						<SessionCategoryGroups
							groups={storeGroups}
							isCompleted={isCompleted}
							priceByItemId={priceByItemId}
							defaultOpen={!startCollapsed}
							prefix='session-store-category'
						/>
					</section>
					<CategorySection
						category='other-stores'
						title='Other Stores and Untagged'
						count={String(sections.otherItems.length)}
						defaultOpen={sections.storeItems.length === 0}
						testId='session-other-stores-section'
					>
						<SessionCategoryGroups
							groups={otherGroups}
							isCompleted={isCompleted}
							priceByItemId={priceByItemId}
							defaultOpen={!startCollapsed}
							prefix='session-other-category'
						/>
					</CategorySection>
				</>
			) : (
				<SessionCategoryGroups
					groups={groups}
					isCompleted={isCompleted}
					priceByItemId={priceByItemId}
					defaultOpen={!startCollapsed}
					prefix='session-category'
				/>
			)}
		</section>
	)
}

interface SessionCategoryGroupsProps {
	groups: CategoryGroup<ShoppingSessionItem>[]
	isCompleted: boolean
	priceByItemId?: Record<string, number>
	defaultOpen: boolean
	prefix: string
}

function SessionCategoryGroups({ groups, isCompleted, priceByItemId, defaultOpen, prefix }: SessionCategoryGroupsProps) {
	return groups.map((group, index) => {
		const done = group.items.filter(item => item.checked).length

		return (
			<CategorySection
				key={group.key}
				category={group.key}
				title={group.title}
				count={`${done}/${group.items.length}`}
				complete={done === group.items.length}
				defaultOpen={defaultOpen}
				className={index === 0 ? 'border-t-0' : undefined}
				testId={`${prefix}-${group.key}`}
			>
				<ul className='divide-y divide-slate-200/70 dark:divide-border'>
					{group.items.map(item => (
						<li key={item.id}>
							<ShoppingSessionItemRow item={item} isCompleted={isCompleted} averagePrice={priceByItemId?.[item.id]} />
						</li>
					))}
				</ul>
			</CategorySection>
		)
	})
}
