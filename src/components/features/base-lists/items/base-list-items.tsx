'use client'

import { useMemo } from 'react'

import {
	CategoryCollapseControl,
	CategorySection,
	EmptyStateCard,
	useCategorySectionExpansion,
} from '@/components/commons'
import { AddItemSheet, BaseListLockedNotice } from '@/components/features/list-items'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Card } from '@/components/ui/card'
import { groupByCategory } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

import { BaseListItemRow } from './base-list-item-row'

interface BaseListItemsProps {
	baseListId: string
	/** The list's name, printed on the empty ticket. */
	listName?: string
	items: BaseListItemWithStoreSummary[]
	isLocked?: boolean
	isOwner?: boolean
}

/** The items of a base list in one card, a collapsible section per category; or the card that invites adding the first item. */
export function BaseListItems({ baseListId, listName = 'Items', items, isLocked = false, isOwner = true }: BaseListItemsProps) {
	const groups = useMemo(
		() => groupByCategory([...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))),
		[items],
	)
	const sectionDescriptors = groups.map(group => ({ id: `base-list-category-${group.key}`, defaultOpen: true }))
	const expansion = useCategorySectionExpansion(sectionDescriptors)

	if (items.length === 0) {
		return (
			<EmptyStateCard
				stub={{ label: listName, count: '0 items' }}
				ghost='items'
				title='No items yet'
				description={
					isLocked
						? 'A shopping session is using this list.'
						: 'Type them in, or upload a receipt and pick the ones you want here.'
				}
				testId='base-list-empty-state'
			>
				{isLocked ? <BaseListLockedNotice testId='base-list-locked-notice' className='mb-3' /> : null}
				<div className='flex w-full flex-col items-stretch gap-2'>
					<AddItemSheet
						target={{ context: 'base-list', baseListId }}
						label='Add Items'
						isLocked={isLocked}
						variant='secondary'
						size='xl'
						className='w-full'
					/>
					{isLocked ? null : (
						<UploadTicketDialog
							variant='default'
							size='xl'
							className='w-full'
						/>
					)}
				</div>
			</EmptyStateCard>
		)
	}

	return (
		<Card
			aria-label='Items by category'
			data-testid='base-list-items-card'
			size='list'
		>
			{isLocked ? <BaseListLockedNotice testId='base-list-locked-notice' className='mb-3' /> : null}
			<CategoryCollapseControl
				allCollapsed={expansion.allCollapsed}
				onToggle={expansion.toggleAll}
				testId='base-list-category-collapse-control'
			/>
			<div className='-mt-4'>
				{groups.map((group, index) => {
					const id = `base-list-category-${group.key}`
					return (
						<CategorySection
							key={group.key}
							category={group.key}
							title={group.title}
							count={group.items.length}
							className={index === 0 ? 'border-t-0' : undefined}
							open={expansion.isOpen(id, true)}
							onOpenChange={open => expansion.onOpenChange(id, open)}
							testId={id}
						>
							<ul className='divide-y divide-slate-200/70 dark:divide-border'>
								{group.items.map(item => (
									<li key={item.id}>
										<BaseListItemRow
											item={item}
											isLocked={isLocked}
											isOwner={isOwner}
										/>
									</li>
								))}
							</ul>
						</CategorySection>
					)
				})}
			</div>
		</Card>
	)
}
