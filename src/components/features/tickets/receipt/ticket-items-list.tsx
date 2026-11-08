'use client'

import { useId, useMemo } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryCollapseControl, CategorySection, useCategorySectionExpansion } from '@/components/commons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { buildListDisplayNames } from '@/utils'
import type { TicketItem } from '@/types'
import type { TicketItemMatch } from '@/lib/api/endpoints/tickets'

import { groupTicketItems } from './helpers/group-ticket-items'
import { TicketItemRow } from './ticket-item-row'
import { TicketTriageSection } from './ticket-triage-section'
import type { TicketSelection } from './hooks/use-ticket-selection'
import type { ReceiptMatchActions } from './hooks/use-receipt-match-actions'
import type { TicketItemGroup } from './helpers/group-ticket-items'
import type { ReceiptTriageSection, ReceiptTriageStatus } from './helpers/build-receipt-triage'
import { receiptItemsView } from './helpers/receipt-triage-view'
import type { BaseList } from '../add-to-list/helpers/merge-ticket-items'

export interface TicketItemsTriage {
	status: ReceiptTriageStatus
	baseList: { id: string; name: string } | null
	baseLists: BaseList[]
	triage: ReceiptTriageSection[]
	matches: TicketItemMatch[]
	actions: ReceiptMatchActions
	changeList: (baseListId: string) => void
	retry: () => void
}

interface TicketItemsListProps {
	items: TicketItem[]
	selection: TicketSelection
	canSelect: boolean
	triage?: TicketItemsTriage
}

/** "Include all" and the receipt's items by category. Controlled by the caller's selection, so the page and the compare view agree. */
export function TicketItemsList({ items, selection, canSelect, triage }: TicketItemsListProps) {
	const groups = useMemo(() => groupTicketItems(items), [items])
	const triageMode = receiptItemsView(triage?.status) === 'triage'
	const activeTriage = triage && triageMode ? triage : null
	const readyTriage = triage?.status === 'ready' ? triage : null
	const checkAll = selection.allSelected ? true : selection.partiallySelected ? 'indeterminate' : false
	const sectionDescriptors = readyTriage
		? readyTriage.triage.map(section => ({ id: `receipt-triage-${section.id}`, defaultOpen: !section.startsFolded }))
		: triageMode
			? []
			: groups.map(group => ({ id: `ticket-category-${group.key}`, defaultOpen: true }))
	const expansion = useCategorySectionExpansion(sectionDescriptors)

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
			{activeTriage?.baseList ? <TargetListRow triage={activeTriage} baseList={activeTriage.baseList} /> : null}
			{sectionDescriptors.length > 0 ? (
				<CategoryCollapseControl
					allCollapsed={expansion.allCollapsed}
					onToggle={expansion.toggleAll}
					testId='ticket-category-collapse-control'
				/>
			) : null}
			{canSelect && !triageMode ? (
				<label className='mt-2 flex min-h-14 cursor-pointer items-center gap-1 border-t border-slate-100 dark:border-border'>
					<span className='flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							checked={checkAll}
							onCheckedChange={selection.toggleAll}
							aria-label='Include all items'
							size='lg'
						/>
					</span>
					<span
						aria-live='polite'
						className='text-sm leading-[1.3] font-medium'
					>
						{selection.count === 0 ? 'Include all items to add to a list' : `${selection.count} of ${items.length} included`}
					</span>
				</label>
			) : null}
			{activeTriage?.status === 'switching' ? (
				<div data-testid='receipt-triage-switching' role='status' className='my-3 flex items-center gap-3 rounded-2xl bg-muted px-4 py-6 dark:bg-muted/50'>
					<HugeiconsIcon icon={Loading03Icon} strokeWidth={2} aria-hidden='true' className='size-5 shrink-0 animate-spin text-primary motion-reduce:animate-none' />
					<p className='text-sm font-medium'>Comparing with {activeTriage.baseList?.name}…</p>
				</div>
			) : null}
			{readyTriage && readyTriage.triage.length === 1 && readyTriage.triage[0].id === 'matched' ? (
				<p data-testid='receipt-all-match' role='note' className='py-3 text-sm leading-normal text-muted-foreground'>
					<b className='font-semibold text-foreground'>All {readyTriage.triage[0].lines.length} {readyTriage.triage[0].lines.length === 1 ? 'item matches' : 'items match'} {readyTriage.baseList?.name}.</b> Same names as last time. Nothing needs a look.
				</p>
			) : null}
			{readyTriage ? readyTriage.triage.map(section => (
				<TicketTriageSection
					key={section.id}
					section={section}
					open={expansion.isOpen(`receipt-triage-${section.id}`, !section.startsFolded)}
					onOpenChange={open => expansion.onOpenChange(`receipt-triage-${section.id}`, open)}
					listName={readyTriage.baseList?.name ?? ''}
					selection={selection}
					canSelect={canSelect}
					actions={readyTriage.actions}
				/>
			)) : triageMode ? null : groups.map(group => (
				<TicketCategorySection key={group.key} group={group} selection={selection} canSelect={canSelect} expansion={expansion} />
			))}
		</div>
	)
}

interface TargetListRowProps {
	triage: TicketItemsTriage
	baseList: { id: string; name: string }
}

/** The list the lines are compared with and will be added to, with the way to pick another one. */
function TargetListRow({ triage, baseList }: TargetListRowProps) {
	const labelId = useId()
	const listLabels = useMemo(() => buildListDisplayNames(triage.baseLists), [triage.baseLists])

	return (
		<div data-testid='receipt-target-list' className='flex flex-col gap-2 border-b border-slate-100 py-3 dark:border-border sm:flex-row sm:items-center'>
			<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<span id={labelId} className='text-sm font-medium'>Add to</span>
				<span className='text-xs leading-normal text-muted-foreground'>Each line is compared with this list.</span>
			</div>
			<Select value={baseList.id} onValueChange={triage.changeList}>
				<SelectTrigger size='lg' aria-labelledby={labelId} data-testid='receipt-target-list-select' className='sm:w-auto sm:min-w-48'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{triage.baseLists.map(list => <SelectItem key={list.id} value={list.id}>{listLabels.get(list.id) ?? list.name}</SelectItem>)}
				</SelectContent>
			</Select>
		</div>
	)
}

interface TicketCategorySectionProps {
	group: TicketItemGroup
	selection: TicketSelection
	canSelect: boolean
	expansion: Pick<ReturnType<typeof useCategorySectionExpansion>, 'isOpen' | 'onOpenChange'>
}

/** A category of the receipt that folds away: its coloured icon and name, how many items it holds, and its rows on a soft surface. */
function TicketCategorySection({ group, selection, canSelect, expansion }: TicketCategorySectionProps) {
	const count = group.items.length
	const id = `ticket-category-${group.key}`

	return (
		<CategorySection
			category={group.key}
			title={group.title}
			count={`${count} ${count === 1 ? 'item' : 'items'}`}
			open={expansion.isOpen(id, true)}
			onOpenChange={open => expansion.onOpenChange(id, open)}
			testId={id}
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
