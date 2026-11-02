'use client'

import { Button } from '@/components/ui/button'
import { CategoryHeading, CategorySection } from '@/components/commons'

import { TicketItemRow } from './ticket-item-row'
import type { ReceiptTriageSection } from './helpers/build-receipt-triage'
import { receiptBulkSelectionIds } from './helpers/receipt-triage-view'
import type { ReceiptMatchActions } from './hooks/use-receipt-match-actions'
import type { TicketSelection } from './hooks/use-ticket-selection'

interface TicketTriageSectionProps {
	section: ReceiptTriageSection
	listName: string
	selection: TicketSelection
	canSelect: boolean
	actions: ReceiptMatchActions
}

const countLabel = (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`

/**
 * One status of the comparison ("Needs a look", "New to <list>", "Matched to <list>"): its lines split by category, and for the
 * matched ones the bulk "Include All" with its Undo. Including a line is not confirming its match.
 */
export function TicketTriageSection({ section, listName, selection, canSelect, actions }: TicketTriageSectionProps) {
	const title = section.id === 'check' ? 'Needs a look' : section.id === 'fresh' ? `New to ${listName}` : `Matched to ${listName}`
	const ids = receiptBulkSelectionIds([section], section.id)
	const allIncluded = ids.length > 0 && ids.every(id => selection.isSelected(id))

	return (
		<div data-testid={`receipt-triage-section-${section.id}`}>
			{section.id === 'matched' && canSelect ? (
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
				count={countLabel(section.lines.length)}
				defaultOpen={!section.startsFolded}
				testId={`receipt-triage-${section.id}`}
			>
				<div className='divide-y divide-slate-200/70 dark:divide-border'>
					{section.categories.map(category => (
						<div key={category.key} data-testid={`receipt-triage-${section.id}-category-${category.key}`}>
							<div className='flex items-center gap-3 px-3.5 pt-2.5 pb-1'>
								<CategoryHeading
									category={category.key}
									title={category.title}
									count={String(category.lines.length)}
									testId={`receipt-triage-${section.id}-heading-${category.key}`}
								/>
							</div>
							<ul className='divide-y divide-slate-200/70 dark:divide-border'>
								{category.lines.map(line => (
									<li key={line.item.id}>
										<TicketItemRow
											item={line.item}
											canSelect={canSelect}
											selected={selection.isSelected(line.item.id)}
											onSelectToggle={selection.toggle}
											line={line}
											actions={actions}
										/>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</CategorySection>
		</div>
	)
}
