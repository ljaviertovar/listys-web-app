'use client'

import { SelectionBar } from '@/components/commons'
import { Button } from '@/components/ui/button'

import { StartShoppingDialog } from '../start-shopping-dialog'
import type { BaseListItemWithStoreSummary } from '@/types'

interface NeededSelectionBarProps {
	baseListId: string
	baseListName: string
	/** Every item of the list, checked or not. */
	items: BaseListItemWithStoreSummary[]
	/** The items on screen; fewer than `items` while "Show items from" narrows the list. */
	shownItems: BaseListItemWithStoreSummary[]
	isSaving: boolean
	onClear: () => void
}

/** How many items are checked for the next trip, with "Clear" and a way to start it from anywhere in a long list. */
export function NeededSelectionBar({ baseListId, baseListName, items, shownItems, isSaving, onClear }: NeededSelectionBarProps) {
	const count = items.filter(item => item.needed_at).length
	if (count === 0) return null

	const isNarrowed = shownItems.length < items.length
	const detail = isSaving ? 'Saving…' : isNarrowed ? `${shownItems.filter(item => item.needed_at).length} shown here` : 'Saved for later'

	return (
		<SelectionBar
			testId='needed-selection-bar'
			ariaLabel='Checked items'
			busy={isSaving}
			summary={
				<>
					<span aria-live='polite' className='text-sm leading-[1.2] font-medium'>
						<b className='font-mono font-medium tabular-nums'>{count}</b> to buy
					</span>
					<span className='truncate text-xs leading-[1.2] text-slate-300'>{detail}</span>
				</>
			}
		>
			<Button type='button' variant='on-dark-ghost' size='sm' onClick={onClear}>
				Clear
			</Button>
			<StartShoppingDialog
				baseListId={baseListId}
				baseListName={baseListName}
				itemsCount={items.length}
				items={items}
				savingChecks={isSaving}
				triggerTestId='start-shopping-from-checks'
				size='sm'
				className='w-auto'
			>
				Start Shopping
			</StartShoppingDialog>
		</SelectionBar>
	)
}
