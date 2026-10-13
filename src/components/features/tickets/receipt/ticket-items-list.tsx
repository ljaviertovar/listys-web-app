'use client'

import { useMemo, useId } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { CategorySection } from '@/components/commons'
import { formatCurrency, formatItemName } from '@/utils'
import type { TicketItem } from '@/types'

import { groupTicketItems } from './helpers/group-ticket-items'
import type { TicketSelection } from './hooks/use-ticket-selection'
import type { TicketItemGroup } from './helpers/group-ticket-items'

interface TicketItemsListProps {
	items: TicketItem[]
	selection: TicketSelection
	canSelect: boolean
}

/** A receipt this short is read in one go; longer ones open only their first categories so the page does not run for screens. */
const OPEN_ALL_UP_TO = 12
const OPEN_FIRST_WHEN_LONG = 2

/** "Select all" and the receipt's items by category. Controlled by the caller's selection, so the page and the compare view agree. */
export function TicketItemsList({ items, selection, canSelect }: TicketItemsListProps) {
	const groups = useMemo(() => groupTicketItems(items), [items])
	const checkAll = selection.allSelected ? true : selection.partiallySelected ? 'indeterminate' : false

	return (
		<div data-testid='ticket-items-list'>
			{canSelect ? (
				<label className='mt-2 flex min-h-14 cursor-pointer items-center gap-1 border-t border-slate-100 dark:border-border'>
					<span className='flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							checked={checkAll}
							onCheckedChange={selection.toggleAll}
							aria-label='Select all items'
							className='size-[22px] rounded-[7px] border-slate-400 bg-white dark:bg-transparent'
						/>
					</span>
					<span
						aria-live='polite'
						className='text-sm leading-[1.3] font-medium'
					>
						{selection.count === 0 ? 'Select all items to add to a list' : `${selection.count} of ${items.length} selected`}
					</span>
				</label>
			) : null}
			{groups.map((group, index) => (
				<TicketCategorySection
					key={group.key}
					group={group}
					selection={selection}
					canSelect={canSelect}
					defaultOpen={items.length <= OPEN_ALL_UP_TO || index < OPEN_FIRST_WHEN_LONG}
				/>
			))}
		</div>
	)
}

interface TicketCategorySectionProps {
	group: TicketItemGroup
	selection: TicketSelection
	canSelect: boolean
	defaultOpen: boolean
}

/** A category of the receipt that folds away: its coloured icon and name, how many items it holds, and its rows on a soft surface. */
export function TicketCategorySection({ group, selection, canSelect, defaultOpen }: TicketCategorySectionProps) {
	const count = group.items.length

	return (
		<CategorySection
			category={group.key}
			title={group.title}
			count={`${count} ${count === 1 ? 'item' : 'items'}`}
			defaultOpen={defaultOpen}
			testId={`ticket-category-${group.key}`}
		>
			<ul className='divide-y divide-slate-200/70 dark:divide-border'>
				{group.items.map(item => (
					<li key={item.id}>
						<TicketItemRow
							item={item}
							canSelect={canSelect}
							selected={selection.isSelected(item.id)}
							onSelectToggle={selection.toggle}
						/>
					</li>
				))}
			</ul>
		</CategorySection>
	)
}

interface TicketItemRowProps {
	item: TicketItem
	canSelect?: boolean
	selected?: boolean
	onSelectToggle?: (id: string) => void
}

/** One extracted item: a 44px checkbox target, the name in Title Case, its quantity chip and the line price in mono. */
export function TicketItemRow({ item, canSelect = false, selected = false, onSelectToggle }: TicketItemRowProps) {
	const checkboxId = useId()
	const name = formatItemName(item.name)

	return (
		<label
			htmlFor={canSelect ? checkboxId : undefined}
			data-testid={`ticket-item-row-${item.id}`}
			data-selected={selected}
			className={`flex min-h-16 items-center gap-1 py-1.5 pr-3.5 lg:min-h-14 lg:gap-3 ${canSelect ? 'cursor-pointer' : 'pl-3.5'}`}
		>
			{canSelect ? (
				<span className='flex size-11 shrink-0 items-center justify-center'>
					<Checkbox
						id={checkboxId}
						checked={selected}
						onCheckedChange={() => onSelectToggle?.(item.id)}
						aria-label={name}
						className='size-[22px] rounded-[7px] border-slate-400 bg-white dark:bg-transparent'
					/>
				</span>
			) : null}
			<span className='flex min-w-0 flex-1 flex-col items-start gap-1.5 pl-1 lg:contents'>
				<span className='w-full truncate text-sm leading-[1.25] font-semibold lg:min-w-0 lg:flex-1'>{name}</span>
				<span className='inline-flex h-[22px] items-center gap-1 rounded-[7px] bg-[#E9ECF0] px-2 text-xs leading-none font-medium text-slate-600 lg:shrink-0 dark:bg-muted dark:text-muted-foreground'>
					<b className='font-mono font-semibold text-foreground tabular-nums'>{item.quantity ?? 1}</b>
					{item.unit || 'unit'}
				</span>
			</span>
			{item.price !== null ? (
				<span className='font-mono text-sm font-semibold tabular-nums lg:w-20 lg:text-right'>{formatCurrency(item.price)}</span>
			) : null}
		</label>
	)
}
