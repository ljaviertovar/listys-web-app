'use client'

import { useId, useMemo } from 'react'
import { Alert02Icon, ListViewIcon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryCollapseControl, CategorySection, LoadingState, RowIcon, useCategorySectionExpansion } from '@/components/commons'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
import { InputGroupAddon } from '@/components/ui/input-group'
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
		? readyTriage.triage.map(section => ({ id: `receipt-triage-${section.id}`, defaultOpen: true }))
		: triageMode
			? []
			: groups.map(group => ({ id: `ticket-category-${group.key}`, defaultOpen: true }))
	const expansion = useCategorySectionExpansion(sectionDescriptors)
	const isComparing = activeTriage?.status === 'loading' || activeTriage?.status === 'switching'
	const showControls = !isComparing && (canSelect || sectionDescriptors.length > 0)

	return (
		<div data-testid='ticket-items-list'>
			{triage?.status === 'failed' ? (
				<Alert variant='warning' data-testid='receipt-triage-fallback' className='mt-3'>
					<RowIcon icon={Alert02Icon} tone='warning' size='alert' testId='receipt-triage-fallback-icon' />
					<AlertTitle>Couldn’t compare these lines</AlertTitle>
					<AlertDescription>
						<div className='flex flex-col items-start gap-2'>
							<span>Try again to compare them with your list.</span>
							<Button type='button' variant='destructive' size='lg' onClick={triage.retry}>Retry</Button>
						</div>
					</AlertDescription>
				</Alert>
			) : null}
			{activeTriage?.baseList ? <TargetListRow triage={activeTriage} baseList={activeTriage.baseList} /> : null}
			{activeTriage?.status === 'loading' || activeTriage?.status === 'switching' ? (
				<LoadingState testId='receipt-triage-switching' label={activeTriage.status === 'loading' ? 'Loading your list…' : `Comparing with ${activeTriage.baseList?.name}…`} />
			) : null}
			{showControls ? (
				<div className='mt-1 grid grid-cols-2 items-center'>
					{canSelect ? (
						<label className='flex min-h-11 w-full cursor-pointer items-center font-display text-sm leading-none font-semibold'>
							<span className='flex size-11 shrink-0 items-center justify-center'>
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
			{readyTriage ? readyTriage.triage.map((section, index) => (
				<TicketTriageSection
					key={section.id}
					section={section}
					first={index === 0}
					open={expansion.isOpen(`receipt-triage-${section.id}`, true)}
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
	const listAnchor = useComboboxAnchor()
	const listLabels = useMemo(() => buildListDisplayNames(triage.baseLists), [triage.baseLists])

	return (
		<div data-testid='receipt-target-list' className='mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-border'>
			<div className='flex min-w-0 flex-col gap-0.5'>
				<span id={labelId} className='text-sm leading-[1.3] font-semibold'>Add to</span>
				<span className='text-xs leading-[1.4] text-muted-foreground dark:text-muted-foreground'>Each line is compared with this list.</span>
			</div>
			<Combobox
				items={triage.baseLists.map(list => list.id)}
				itemToStringLabel={id => listLabels.get(id) ?? triage.baseLists.find(list => list.id === id)?.name ?? ''}
				value={baseList.id}
				onValueChange={id => typeof id === 'string' && triage.changeList(id)}
			>
				<div className='w-full' ref={listAnchor}>
				<ComboboxInput size='lg' surface='form' aria-labelledby={labelId} data-testid='receipt-target-list-select'>
					<InputGroupAddon align='inline-start'>
						<RowIcon icon={ListViewIcon} tone='primary' size='stat' testId='receipt-target-list-input-icon' />
					</InputGroupAddon>
				</ComboboxInput>
				</div>
				<ComboboxContent anchor={listAnchor}>
					<ComboboxList>
						{(id: string) => {
							const list = triage.baseLists.find(candidate => candidate.id === id)
							if (!list) return null
							return (
								<ComboboxItem key={list.id} value={list.id}>
									<RowIcon icon={ListViewIcon} tone='primary' size='stat' testId='receipt-target-list-option-icon' />
									{listLabels.get(list.id) ?? list.name}
								</ComboboxItem>
							)
						}}
					</ComboboxList>
					<ComboboxEmpty>No lists available.</ComboboxEmpty>
				</ComboboxContent>
			</Combobox>
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
