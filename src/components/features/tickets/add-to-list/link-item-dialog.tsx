'use client'

import { useState, type FormEvent } from 'react'

import { SearchableChoiceList, SheetDialog } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { formatItemName } from '@/utils'

import type { MatchedItem } from './helpers/merge-review'

interface LinkItemDialogProps {
	/** The receipt line being linked; null keeps the sheet closed. */
	lineName: string | null
	/** The item the line updates now, preselected. */
	currentItemId?: string | null
	items: MatchedItem[]
	onClose: () => void
	onLink: (item: MatchedItem) => void
}

/** Chooses the item of the list that a receipt line is the same product as. */
export function LinkItemDialog({ lineName, currentItemId, items, onClose, onLink }: LinkItemDialogProps) {
	const open = lineName !== null
	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !next && onClose()}
			title='Link to an Item'
			description={lineName ? `Which item of this list is “${formatItemName(lineName)}”? It will update that item, and the next receipt with this line will too.` : undefined}
			testId='link-item-dialog'
		>
			{open ? (
				<LinkItemForm
					currentItemId={currentItemId ?? ''}
					items={items}
					onCancel={onClose}
					onLink={onLink}
				/>
			) : null}
		</SheetDialog>
	)
}

interface LinkItemFormProps {
	currentItemId: string
	items: MatchedItem[]
	onCancel: () => void
	onLink: (item: MatchedItem) => void
}

function LinkItemForm({ currentItemId, items, onCancel, onLink }: LinkItemFormProps) {
	const [query, setQuery] = useState('')
	const [selected, setSelected] = useState(currentItemId)

	const needle = query.replace(/\s+/g, ' ').trim().toLowerCase()
	const matches = needle ? items.filter(item => item.name.toLowerCase().includes(needle)) : items
	const status =
		items.length === 0
			? 'This list has no items to link to.'
			: matches.length === 0
				? 'No item matches this search.'
				: `${matches.length} ${matches.length === 1 ? 'item' : 'items'}`

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		// The sheet is portalled, but React still bubbles `submit` through the component tree to the Add Items form around
		// it, which would send the merge before this link is applied.
		event.stopPropagation()
		const item = items.find(candidate => candidate.id === selected)
		if (item) onLink(item)
	}

	return (
		<form
			data-testid='link-item-form'
			onSubmit={submit}
			noValidate
			className='flex flex-col gap-4'
		>
			<SearchableChoiceList
				searchLabel='Search this list'
				placeholder='e.g. milk'
				query={query}
				onQueryChange={setQuery}
				options={matches.map(item => ({ value: item.id, label: formatItemName(item.name) }))}
				value={selected}
				onValueChange={setSelected}
				status={status}
				testId='link-item-list'
			/>
			<DialogFooter variant='sheet'>
				<Button
					type='button'
					variant='secondary'
					size='primary'
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type='submit'
					size='primary'
					disabled={!selected}
				>
					Link to This Item
				</Button>
			</DialogFooter>
		</form>
	)
}
