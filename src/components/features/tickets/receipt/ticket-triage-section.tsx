'use client'

import { Add01Icon, Tick02Icon, ViewIcon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { CategorySection } from '@/components/commons'
import { formatItemName } from '@/utils'

import { TicketItemRow } from './ticket-item-row'
import type { ReceiptTriageSection, ReceiptTriageSectionId } from './helpers/build-receipt-triage'
import { receiptBulkSelectionIds } from './helpers/receipt-triage-view'
import type { ReceiptMatchActions } from './hooks/use-receipt-match-actions'
import type { TicketSelection } from './hooks/use-ticket-selection'

interface TicketTriageSectionProps {
	section: ReceiptTriageSection
	listName: string
	selection: TicketSelection
	canSelect: boolean
	actions: ReceiptMatchActions
	/** The first section opens the card, so it has no divider above it. */
	first?: boolean
	/** The bulk "Include All N" of the matched lines; redundant when they are the only section, as "Include All" above already does it. */
	bulkInclude?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

const countLabel = (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`

const SECTION_ICONS: Record<ReceiptTriageSectionId, IconSvgElement> = { check: ViewIcon, fresh: Add01Icon, matched: Tick02Icon }

/**
 * One status of the comparison ("Needs a look", "New to <list>", "Matched to <list>"): its lines on one soft surface, and for the
 * matched ones the bulk "Include All" with its Undo. Including a line is not confirming its match.
 */
export function TicketTriageSection({ section, listName, selection, canSelect, actions, first = false, bulkInclude = true, open, onOpenChange }: TicketTriageSectionProps) {
	const title = section.id === 'check' ? 'Needs a look' : section.id === 'fresh' ? `New to ${listName}` : `Matched to ${listName}`
	const ids = receiptBulkSelectionIds([section], section.id)
	const allIncluded = ids.length > 0 && ids.every(id => selection.isSelected(id))
	const pending = section.lines.filter(line => line.proposal !== null)

	return (
		<div data-testid={`receipt-triage-section-${section.id}`}>
			{section.id === 'matched' && canSelect && bulkInclude ? (
				<div className='flex items-center justify-end gap-3 pt-2'>
					{allIncluded ? (
						<>
							<span data-testid='receipt-accepted-matched' aria-live='polite' className='text-sm text-muted-foreground'>
								{ids.length} included
							</span>
							<Button type='button' variant='ghost-primary' size='sm' onClick={() => selection.deselectMany(ids)} data-testid='receipt-undo-accept-matched'>
								Undo
							</Button>
						</>
					) : (
						<Button type='button' variant='ghost-primary' size='sm' onClick={() => selection.selectMany(ids)} data-testid='receipt-select-all-matched'>
							Include All {ids.length}
						</Button>
					)}
				</div>
			) : null}
			<CategorySection
				category={section.id}
				title={title}
				icon={SECTION_ICONS[section.id]}
				tone='primary'
				chevron='up'
				count={countLabel(section.lines.length)}
				defaultOpen={!section.startsFolded}
				open={open}
				onOpenChange={onOpenChange}
				testId={`receipt-triage-${section.id}`}
				className={first ? 'border-t-0' : undefined}
				panelClassName='px-3'
			>
				<ul className='divide-y divide-slate-200/70 dark:divide-border'>
					{section.lines.map(line => (
						<li key={line.item.id}>
							<TicketItemRow
								item={line.item}
								canSelect={canSelect}
								selected={selection.isSelected(line.item.id)}
								onSelectToggle={selection.toggle}
								line={line}
								listName={listName}
								actions={actions}
							/>
						</li>
					))}
				</ul>
			</CategorySection>
			{pending.length > 0 ? (
				<p data-testid='receipt-answer-remembered' className='px-0.5 pt-3 text-xs leading-[1.4] text-muted-foreground dark:text-muted-foreground'>
					{pending.length === 1
						? <>Your answer is remembered: next time “{formatItemName(pending[0].item.name)}” links on its own.</>
						: 'Your answers are remembered: next time these lines link on their own.'}
				</p>
			) : null}
		</div>
	)
}
