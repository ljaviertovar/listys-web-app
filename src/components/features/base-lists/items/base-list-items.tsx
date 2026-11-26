'use client'

import { useMemo, type ReactNode } from 'react'

import {
	CategoryCollapseControl,
	CategorySection,
	EmptyStateCard,
	useCategorySectionExpansion,
} from '@/components/commons'
import { AddItemSheet, BaseListLockedNotice } from '@/components/features/list-items'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { groupByCategory } from '@/utils'
import type { BaseListItemWithStoreSummary } from '@/types'

import { BaseListItemRow } from './base-list-item-row'

interface BaseListItemsProps {
	baseListId: string
	/** The list's name, printed on the empty ticket. */
	listName?: string
	items: BaseListItemWithStoreSummary[]
	/** True when any item of the list is checked, shown or not; without one the card says what checking is for. */
	hasChecks: boolean
	/** Checks or unchecks items as needed for the next trip. */
	onSetNeeded: (items: BaseListItemWithStoreSummary[], needed: boolean) => void
	/** What sits at the foot of the card: the bar of checked items. */
	footer?: ReactNode
	isLocked?: boolean
	isOwner?: boolean
}

/** The items of a base list in one card, a collapsible section per category; or the card that invites adding the first item. */
export function BaseListItems({ baseListId, listName = 'Items', items, hasChecks, onSetNeeded, footer, isLocked = false, isOwner = true }: BaseListItemsProps) {
	const groups = useMemo(
		() => groupByCategory([...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))),
		[items],
	)
	const sectionDescriptors = groups.map(group => ({ id: `base-list-category-${group.key}`, defaultOpen: true }))
	const expansion = useCategorySectionExpansion(sectionDescriptors)

	const shownCheckedCount = items.filter(item => item.needed_at).length
	const allShownChecked = items.length > 0 && shownCheckedCount === items.length

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
		<div>
			<Card
				aria-label='Items by category'
				data-testid='base-list-items-card'
				size='list'
			>
				{isLocked ? <BaseListLockedNotice testId='base-list-locked-notice' className='mb-3' /> : null}
				<div className='grid grid-cols-2 items-center'>
					<label className='flex min-h-11 w-full cursor-pointer items-center font-display text-sm leading-none font-semibold has-disabled:cursor-not-allowed has-disabled:opacity-50'>
						<span className='flex size-11 shrink-0 items-center justify-center'>
							<Checkbox
								size='lg'
								checked={allShownChecked ? true : shownCheckedCount > 0 ? 'indeterminate' : false}
								onCheckedChange={() => onSetNeeded(items, !allShownChecked)}
								disabled={isLocked}
								aria-label='Select all items shown'
							/>
						</span>
						Select All
					</label>
					<CategoryCollapseControl
						allCollapsed={expansion.allCollapsed}
						onToggle={expansion.toggleAll}
						testId='base-list-category-collapse-control'
					/>
				</div>
				{!hasChecks && !isLocked ? (
					<Alert variant='info' role='note' data-testid='base-list-check-hint' className='mb-2'>
						<AlertDescription>Check what you need. It stays checked until you buy it.</AlertDescription>
					</Alert>
				) : null}
				<div className='-mt-4'>
					{groups.map((group, index) => {
						const id = `base-list-category-${group.key}`
						const checkedCount = group.items.filter(item => item.needed_at).length
						return (
							<CategorySection
								key={group.key}
								category={group.key}
								title={group.title}
								count={checkedCount > 0 ? `${checkedCount} of ${group.items.length} checked` : group.items.length}
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
												onNeededChange={needed => onSetNeeded([item], needed)}
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
			{/* Outside the card, which clips its surface: the bar needs the page as its sticky and fixed context. */}
			{footer}
		</div>
	)
}
