'use client'

import { useMemo, useId } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CategorySection } from '@/components/commons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { buildListDisplayNames, formatCurrency, formatItemName } from '@/utils'
import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

import { groupTicketItems } from './helpers/group-ticket-items'
import type { TicketSelection } from './hooks/use-ticket-selection'
import type { TicketItemGroup } from './helpers/group-ticket-items'
import type { ReceiptTriageSection, ReceiptTriageStatus } from './helpers/build-receipt-triage'
import { receiptBulkSelectionIds, receiptItemsView } from './helpers/receipt-triage-view'
import type { BaseList } from '../add-to-list/helpers/merge-ticket-items'

export interface TicketItemsTriage {
	status: ReceiptTriageStatus
	baseList: { id: string; name: string } | null
	baseLists: BaseList[]
	triage: ReceiptTriageSection[]
	matches: TicketItemMatch[]
	changeList: (baseListId: string) => void
	retry: () => void
}

interface TicketItemsListProps {
	items: TicketItem[]
	selection: TicketSelection
	canSelect: boolean
	triage?: TicketItemsTriage
}

/** "Select all" and the receipt's items by category. Controlled by the caller's selection, so the page and the compare view agree. */
export function TicketItemsList({ items, selection, canSelect, triage }: TicketItemsListProps) {
	const groups = useMemo(() => groupTicketItems(items), [items])
	const activeTriage = triage?.status === 'ready' ? triage : null
	const triageMode = receiptItemsView(triage?.status) === 'triage'
	const checkAll = selection.allSelected ? true : selection.partiallySelected ? 'indeterminate' : false
	const listLabels = useMemo(() => buildListDisplayNames(triage?.baseLists ?? []), [triage?.baseLists])

	return (
		<div data-testid='ticket-items-list'>
			{triage?.status === 'failed' ? (
				<Alert variant='warning' data-testid='receipt-triage-fallback' className='mt-3'>
					<AlertDescription>
						<span className='flex flex-wrap items-center justify-between gap-2'>
							<span>Couldn’t compare these lines with your list.</span>
							<Button type='button' variant='quiet' size='sm' onClick={triage.retry}>Try Again</Button>
						</span>
					</AlertDescription>
				</Alert>
			) : null}
			{activeTriage?.baseList ? (
				<div data-testid='receipt-target-list' className='flex flex-col gap-2 border-b border-slate-100 py-3 dark:border-border sm:flex-row sm:items-center'>
					<span className='min-w-0 flex-1 text-sm font-medium'>Comparing with {activeTriage.baseList.name}</span>
					<Select value={activeTriage.baseList.id} onValueChange={activeTriage.changeList}>
						<SelectTrigger size='lg' aria-label='Comparing with list' data-testid='receipt-target-list-select' className='sm:w-auto sm:min-w-48'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{activeTriage.baseLists.map(list => <SelectItem key={list.id} value={list.id}>{listLabels.get(list.id) ?? list.name}</SelectItem>)}
						</SelectContent>
					</Select>
				</div>
			) : null}
			{canSelect && !triageMode ? (
				<label className='mt-2 flex min-h-14 cursor-pointer items-center gap-1 border-t border-slate-100 dark:border-border'>
					<span className='flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							checked={checkAll}
							onCheckedChange={selection.toggleAll}
							aria-label='Select all items'
							size='lg'
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
			{activeTriage ? activeTriage.triage.map(section => (
				<TriageSection
					key={section.id}
					section={section}
					listName={activeTriage.baseList?.name ?? ''}
					selection={selection}
					canSelect={canSelect}
				/>
			)) : groups.map(group => (
				<TicketCategorySection key={group.key} group={group} selection={selection} canSelect={canSelect} />
			))}
		</div>
	)
}

interface TriageSectionProps {
	section: ReceiptTriageSection
	listName: string
	selection: TicketSelection
	canSelect: boolean
}

function TriageSection({ section, listName, selection, canSelect }: TriageSectionProps) {
	const title = section.id === 'check' ? 'Check these' : section.id === 'fresh' ? `New to ${listName}` : `In ${listName}`
	const ids = receiptBulkSelectionIds([section], section.id)
	const status = section.id === 'check' ? 'check' : section.id === 'fresh' ? 'new' : 'in-list'

	return (
		<div data-testid={`receipt-triage-section-${section.id}`}>
			{section.id === 'matched' && canSelect ? (
				<div className='flex justify-end pt-2'>
					<Button type='button' variant='ghost-primary' size='sm' onClick={() => selection.selectMany(ids)} data-testid='receipt-select-all-matched'>
						Select all {ids.length}
					</Button>
				</div>
			) : null}
			<CategorySection
				category={section.id}
				title={title}
				count={`${section.lines.length} ${section.lines.length === 1 ? 'item' : 'items'}`}
				defaultOpen={!section.startsFolded}
				testId={`receipt-triage-${section.id}`}
			>
				<ul className='divide-y divide-slate-200/70 dark:divide-border'>
					{section.lines.map(line => (
						<li key={line.item.id}>
							<TicketItemRow
								item={line.item}
								canSelect={canSelect}
								selected={selection.isSelected(line.item.id)}
								onSelectToggle={selection.toggle}
								status={status}
								reasons={line.reasons}
								remembered={line.remembered}
							/>
						</li>
					))}
				</ul>
			</CategorySection>
		</div>
	)
}

interface TicketCategorySectionProps {
	group: TicketItemGroup
	selection: TicketSelection
	canSelect: boolean
}

/** A category of the receipt that folds away: its coloured icon and name, how many items it holds, and its rows on a soft surface. */
export function TicketCategorySection({ group, selection, canSelect }: TicketCategorySectionProps) {
	const count = group.items.length

	return (
		<CategorySection
			category={group.key}
			title={group.title}
			count={`${count} ${count === 1 ? 'item' : 'items'}`}
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
	status?: 'check' | 'new' | 'in-list'
	reasons?: string[]
	remembered?: boolean
}

/** One extracted item: a 44px checkbox target, the name in Title Case, its quantity chip and the line price in mono. */
export function TicketItemRow({ item, canSelect = false, selected = false, onSelectToggle, status, reasons = [], remembered = false }: TicketItemRowProps) {
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
						size='lg'
					/>
				</span>
			) : null}
			<span className='flex min-w-0 flex-1 flex-col items-start gap-1.5 pl-1 lg:contents'>
				<span className='w-full truncate text-sm leading-[1.25] font-semibold lg:min-w-0 lg:flex-1'>{name}</span>
				{status ? (
					<span className='flex w-full flex-wrap items-center gap-1.5 lg:min-w-0 lg:flex-1'>
						<Badge variant={status === 'check' ? 'processing' : status === 'new' ? 'neutral' : 'completed'}>{status === 'check' ? 'Check' : status === 'new' ? 'New' : 'In list'}</Badge>
						{remembered ? <span className='text-xs text-muted-foreground'>Remembered from an earlier receipt</span> : null}
						{reasons.map(reason => <span key={reason} className='text-xs text-muted-foreground'>{reason}</span>)}
					</span>
				) : null}
				<span className='inline-flex h-5.5 items-center gap-1 rounded-md bg-secondary px-2 text-xs leading-none font-medium text-slate-600 lg:shrink-0 dark:bg-muted dark:text-muted-foreground'>
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
