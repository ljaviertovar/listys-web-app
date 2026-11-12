'use client'

import { useId, useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, CheckmarkCircle02Icon, ListViewIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryCollapseControl, CategorySection, RowIcon, useCategorySectionExpansion } from '@/components/commons'
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
	const [reviewingAll, setReviewingAll] = useState(false)
	const allMatched = readyTriage !== null && readyTriage.triage.length === 1 && readyTriage.triage[0].id === 'matched'
	// Only a receipt the list already knows line by line says so and waits for "Review All"; one that got there by the user's own
	// decisions keeps its lines in view, with whatever is included.
	const knownByList = readyTriage !== null && readyTriage.matches.every(match => match.match === 'name' || match.match === 'alias')
	const linesHidden = allMatched && knownByList && !reviewingAll && selection.count === 0
	const showControls = !linesHidden && activeTriage?.status !== 'switching' && (canSelect || sectionDescriptors.length > 0)

	return (
		<div data-testid='ticket-items-list'>
			{triage?.status === 'failed' ? (
				<Alert variant='receipt-warning' data-testid='receipt-triage-fallback' className='mt-3'>
					<RowIcon icon={Alert02Icon} tone='warning' size='alert' testId='receipt-triage-fallback-icon' />
					<AlertTitle>Couldn’t compare these lines</AlertTitle>
					<AlertDescription className='flex flex-col items-start gap-2'>
						<span>Try again to compare them with your list.</span>
						<Button type='button' variant='destructive' size='alert-action' onClick={triage.retry}>Retry</Button>
					</AlertDescription>
				</Alert>
			) : null}
			{activeTriage?.baseList ? <TargetListRow triage={activeTriage} baseList={activeTriage.baseList} /> : null}
			{activeTriage?.status === 'switching' ? (
				<div data-testid='receipt-triage-switching' role='status' aria-busy='true' className='flex flex-col items-center gap-3 px-4 py-7 text-center'>
					<HugeiconsIcon icon={Loading03Icon} strokeWidth={1.5} aria-hidden='true' className='size-10.5 animate-spin text-primary motion-reduce:animate-none' />
					<p className='text-sm leading-[1.4] font-medium text-muted-foreground dark:text-muted-foreground'>Comparing with {activeTriage.baseList?.name}…</p>
				</div>
			) : null}
			{allMatched && readyTriage ? (
				<>
					<Alert variant='receipt-success' role='status' data-testid='receipt-all-match' className='mt-3'>
						<RowIcon icon={CheckmarkCircle02Icon} tone='success' size='alert' testId='receipt-all-match-icon' />
						<AlertTitle>
							All {readyTriage.triage[0].lines.length} {readyTriage.triage[0].lines.length === 1 ? 'item matches' : 'items match'} your {readyTriage.baseList?.name}
						</AlertTitle>
						<AlertDescription>Same names and sizes as last time. Nothing needs a look.</AlertDescription>
					</Alert>
					{linesHidden ? (
						<Button type='button' variant='outline' size='lg' className='mt-2 w-full' onClick={() => setReviewingAll(true)} data-testid='receipt-review-all'>
							Review All {readyTriage.triage[0].lines.length}
						</Button>
					) : null}
				</>
			) : null}
			{showControls ? (
				<div className='mt-1 flex items-center justify-between gap-2 pl-3'>
					{canSelect ? (
						<label className='flex min-h-11 cursor-pointer items-center pr-3 font-display text-sm leading-none font-semibold'>
							<span className='-ml-2.5 flex size-11 shrink-0 items-center justify-center'>
								<Checkbox
									checked={checkAll}
									onCheckedChange={selection.toggleAll}
									aria-label='Include all items'
									size='lg'
								/>
							</span>
							Include All
						</label>
					) : <span />}
					{sectionDescriptors.length > 0 ? (
						<CategoryCollapseControl
							allCollapsed={expansion.allCollapsed}
							onToggle={expansion.toggleAll}
							testId='ticket-category-collapse-control'
						/>
					) : null}
				</div>
			) : null}
			{linesHidden ? null : readyTriage ? readyTriage.triage.map((section, index) => (
				<TicketTriageSection
					key={section.id}
					section={section}
					first={index === 0}
					bulkInclude={readyTriage.triage.length > 1}
					open={expansion.isOpen(`receipt-triage-${section.id}`, !section.startsFolded)}
					onOpenChange={open => expansion.onOpenChange(`receipt-triage-${section.id}`, open)}
					listName={readyTriage.baseList?.name ?? ''}
					selection={selection}
					canSelect={canSelect}
					actions={readyTriage.actions}
				/>
			)) : triageMode ? null : groups.map((group, index) => (
				<TicketCategorySection key={group.key} group={group} first={index === 0} selection={selection} canSelect={canSelect} expansion={expansion} />
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
		<div data-testid='receipt-target-list' className='mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-border'>
			<div className='flex min-w-0 flex-col gap-0.5'>
				<span id={labelId} className='text-sm leading-[1.3] font-semibold'>Add to</span>
				<span className='text-xs leading-[1.4] text-muted-foreground dark:text-muted-foreground'>Each line is compared with this list.</span>
			</div>
			<Select value={baseList.id} onValueChange={triage.changeList}>
				<SelectTrigger size='filter' aria-labelledby={labelId} data-testid='receipt-target-list-select'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent size='filter'>
					{triage.baseLists.map(list => (
						<SelectItem key={list.id} size='filter' value={list.id}>
							<RowIcon icon={ListViewIcon} tone='primary' size='stat' testId='receipt-target-list-option-icon' />
							{listLabels.get(list.id) ?? list.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

interface TicketCategorySectionProps {
	group: TicketItemGroup
	selection: TicketSelection
	canSelect: boolean
	/** The first section opens the card, so it has no divider above it. */
	first?: boolean
	expansion: Pick<ReturnType<typeof useCategorySectionExpansion>, 'isOpen' | 'onOpenChange'>
}

/** A category of the receipt that folds away: its coloured icon and name, how many items it holds, and its rows on a soft surface. */
function TicketCategorySection({ group, selection, canSelect, first = false, expansion }: TicketCategorySectionProps) {
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
			className={first ? 'border-t-0' : undefined}
			panelClassName='px-3'
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
