'use client'

import { useMemo } from 'react'
import { TaskAdd01Icon } from '@hugeicons/core-free-icons'

import { CategorySection, EmptyStateCard } from '@/components/commons'
import { AddItemSheet } from '@/components/features/list-items'
import { groupByCategory } from '@/utils'
import type { BaseListItem } from '@/types'

import { BaseListItemRow } from './base-list-item-row'

interface BaseListItemsProps {
	baseListId: string
	items: BaseListItem[]
	isLocked?: boolean
}

function BaseListLockedNotice() {
	return (
		<p
			role='note'
			data-testid='base-list-locked-notice'
			className='mb-3 rounded-xl bg-muted px-3.5 py-3 text-sm leading-normal text-muted-foreground'
		>
			A shopping session is using this list. Make changes in that session, or finish it to edit this base list.
		</p>
	)
}

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
				description={isLocked ? 'A shopping session is using this list.' : 'Add what you buy most often, or send the items of a receipt to this list.'}
				testId='base-list-empty-state'
			>
				{isLocked ? <BaseListLockedNotice /> : null}
				<AddItemSheet
					target={{ context: 'base-list', baseListId }}
					isLocked={isLocked}
					variant='default'
				/>
			</EmptyStateCard>
		)
	}

	return (
		<section
			aria-label='Items by category'
			data-testid='base-list-items-card'
			className='rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			{isLocked ? <BaseListLockedNotice /> : null}
			{groups.map((group, index) => (
				<CategorySection
					key={group.key}
					category={group.key}
					title={group.title}
					count={`${group.items.length} ${group.items.length === 1 ? 'item' : 'items'}`}
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
