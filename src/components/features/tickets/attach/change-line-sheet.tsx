'use client'

import { useState } from 'react'

import { ChoiceRow, SearchableChoiceList, SheetDialog } from '@/components/commons'
import { ItemQuantityChip } from '@/components/features/list-items'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DialogFooter } from '@/components/ui/dialog'
import { RadioGroup } from '@/components/ui/radio-group'
import type { TicketSessionMatch } from '@/lib/api/endpoints'
import { formatCurrency, formatItemName } from '@/utils'

import type { AttachReviewLine } from './helpers/build-attach-review'
import { getAvailableChoices, type LineDecision } from './helpers/line-decision'
import type { ReviewSessionItem } from './helpers/plan-quantity-change'
import { TRIP_REVIEW_COPY } from './trip-review-copy'

export function ChangeLineSheet({ line, match, items, listName, onClose, onSave }: {
	line: AttachReviewLine
	match?: TicketSessionMatch
	items: ReviewSessionItem[]
	listName: string
	onClose: () => void
	onSave: (decision: LineDecision) => void
}) {
	const [kind, setKind] = useState(line.decision.kind)
	const [itemId, setItemId] = useState(line.decision.kind === 'match' ? line.decision.itemId : '')
	const [query, setQuery] = useState('')
	const choices = getAvailableChoices(line, match)
	const allowedIds = choices.find(choice => choice.kind === 'match')?.itemIds
	const available = items.filter(item => (!allowedIds || allowedIds.includes(item.id)) && item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
	const labels = { add: 'Add as a new item', match: 'Match a trip item', leave: 'Leave out' }
	const canSave = kind !== 'match' || Boolean(itemId && items.some(item => item.id === itemId && (!allowedIds || allowedIds.includes(item.id))))
	return (
		<SheetDialog open onOpenChange={open => !open && onClose()} title='Change Line' testId='change-line-sheet'>
			<div className='mt-3 flex flex-col gap-4'>
				<Card variant='stat' size='stat' tone='muted'>
					<div className='flex items-center gap-2'>
						<ItemQuantityChip quantity={line.quantity} unit={line.unit} />
						<span className='min-w-0 flex-1 truncate font-mono text-sm font-semibold'>{formatItemName(line.name)}</span>
						<span className='font-mono text-sm font-semibold'>{line.price == null ? '—' : formatCurrency(line.price)}</span>
					</div>
				</Card>
				<RadioGroup aria-label='What this receipt line will do' value={kind} onValueChange={value => setKind(value as LineDecision['kind'])}>
					{choices.map(choice => <ChoiceRow key={choice.kind} variant='card' testId={`change-line-choice-${choice.kind}`} option={{ value: choice.kind, label: labels[choice.kind], disabled: choice.disabled, note: choice.reason ?? TRIP_REVIEW_COPY.choices[choice.kind](listName) }} />)}
				</RadioGroup>
				{kind === 'match' ? <SearchableChoiceList testId='change-line-trip-items' searchLabel='Search trip items' query={query} onQueryChange={setQuery}
					options={available.map(item => ({ value: item.id, label: formatItemName(item.name), note: item.checked ? 'checked' : 'not checked' }))}
					value={itemId} onValueChange={setItemId} status={`${available.length} ${available.length === 1 ? 'item' : 'items'}`} /> : null}
				<DialogFooter variant='sheet'>
					<Button type='button' variant='secondary' size='primary' onClick={onClose}>Cancel</Button>
					<Button type='button' size='primary' disabled={!canSave} onClick={() => onSave(kind === 'match' ? { kind, itemId } : { kind })}>Save</Button>
				</DialogFooter>
			</div>
		</SheetDialog>
	)
}
