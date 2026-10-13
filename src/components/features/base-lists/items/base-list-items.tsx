'use client'

import { useMemo } from 'react'
import { TaskAdd01Icon } from '@hugeicons/core-free-icons'

import { CARD_SURFACE } from '@/components/app/helpers/a1-surface'
import { CategorySection, EmptyStateCard } from '@/components/commons'
import { AddItemSheet } from '@/components/features/list-items'
import { cn, groupByCategory } from '@/utils'
import type { BaseListItem } from '@/types'

import { BaseListItemRow } from './base-list-item-row'

interface BaseListItemsProps {
	baseListId: string
	items: BaseListItem[]
	isLocked?: boolean
}

/** A list this short is read in one go; longer ones open only their first categories so the page does not run for screens. */
const OPEN_ALL_UP_TO = 12
const OPEN_FIRST_WHEN_LONG = 2

/** The items of a base list in one card, a collapsible section per category; or the card that invites adding the first item. */
export function BaseListItems({ baseListId, items, isLocked = false }: BaseListItemsProps) {
	const groups = useMemo(
		() => groupByCategory([...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))),
		[items],
	)

	if (items.length === 0) {
		return (
			<EmptyStateCard
				icon={TaskAdd01Icon}
				tone='amber'
				title='No items yet'
				description='Add what you buy most often, or send the items of a receipt to this list.'
				testId='base-list-empty-state'
			>
				<AddItemSheet
					target={{ context: 'base-list', baseListId }}
					isLocked={isLocked}
					emphasis='primary'
				/>
			</EmptyStateCard>
		)
	}

	return (
		<section
			aria-label='Items by category'
			data-testid='base-list-items-card'
			className={cn('px-4 pt-1', CARD_SURFACE)}
		>
			{groups.map((group, index) => (
				<CategorySection
					key={group.key}
					category={group.key}
					title={group.title}
					count={`${group.items.length} ${group.items.length === 1 ? 'item' : 'items'}`}
					defaultOpen={items.length <= OPEN_ALL_UP_TO || index < OPEN_FIRST_WHEN_LONG}
					className={index === 0 ? 'border-t-0' : undefined}
					testId={`base-list-category-${group.key}`}
				>
					<ul className='divide-y divide-slate-200/70 dark:divide-border'>
						{group.items.map(item => (
							<li key={item.id}>
								<BaseListItemRow
									item={item}
									isLocked={isLocked}
								/>
							</li>
						))}
					</ul>
				</CategorySection>
			))}
		</section>
	)
}
