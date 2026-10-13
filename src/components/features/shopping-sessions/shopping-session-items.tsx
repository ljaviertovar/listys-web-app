'use client'

import { useMemo } from 'react'
import { TaskAdd01Icon } from '@hugeicons/core-free-icons'

import { CARD_SURFACE } from '@/components/app/helpers/a1-surface'
import { CategorySection, EmptyStateCard } from '@/components/commons'
import { cn, groupByCategory } from '@/utils'
import type { ShoppingSessionItem } from '@/types'

import { ShoppingSessionItemRow } from './shopping-session-item-row'

interface ShoppingSessionItemsProps {
	items: ShoppingSessionItem[]
	isCompleted?: boolean
}

/** Unticked items first inside a category, so what is left to buy stays at the top; each group keeps the list's own order. */
function sortForShopping(items: ShoppingSessionItem[]) {
	return [...items].sort((a, b) => {
		if (a.checked !== b.checked) return a.checked ? 1 : -1
		return (a.sort_order || 0) - (b.sort_order || 0)
	})
}

/** The items of a session in one card, a collapsible category each with how many are in the cart ("1/2"). */
export function ShoppingSessionItems({ items, isCompleted = false }: ShoppingSessionItemsProps) {
	const groups = useMemo(() => groupByCategory(sortForShopping(items)), [items])

	if (items.length === 0) {
		return (
			<EmptyStateCard
				icon={TaskAdd01Icon}
				tone='amber'
				title={isCompleted ? 'No purchased items' : 'No items yet'}
				description={
					isCompleted
						? 'No items were marked as purchased in this shopping run.'
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
			className={cn('px-4 pt-1', CARD_SURFACE)}
		>
			{groups.map((group, index) => {
				const done = group.items.filter(item => item.checked).length

				return (
					<CategorySection
						key={group.key}
						category={group.key}
						title={group.title}
						count={`${done}/${group.items.length}`}
						complete={done === group.items.length}
						className={index === 0 ? 'border-t-0' : undefined}
						testId={`session-category-${group.key}`}
					>
						<ul className='divide-y divide-slate-200/70 dark:divide-border'>
							{group.items.map(item => (
								<li key={item.id}>
									<ShoppingSessionItemRow
										item={item}
										isCompleted={isCompleted}
									/>
								</li>
							))}
						</ul>
					</CategorySection>
				)
			})}
		</section>
	)
}
