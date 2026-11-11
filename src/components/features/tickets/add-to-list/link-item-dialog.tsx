'use client'

import { useState, type FormEvent } from 'react'

import { SearchableChoiceList, SheetDialog } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { formatItemName } from '@/utils'

import type { MatchedItem } from './helpers/merge-review'

interface LinkItemDialogProps {
	/** The receipt line being linked; null keeps the sheet closed. */
	lineName: string | null
	/** The list the items belong to, named in the lead-in and under each item ("In Pantry"). */
	listName?: string | null
	/** The item the line updates now, preselected. */
	currentItemId?: string | null
	items: MatchedItem[]
	onClose: () => void
	onLink: (item: MatchedItem) => void
	/** The other way out of the sheet: the line becomes a new item of the list. Without it the sheet offers Cancel instead. */
	onAddAsNew?: () => void
}

/** Chooses the item of the list that a receipt line is the same product as. */
export function LinkItemDialog({ lineName, listName, currentItemId, items, onClose, onLink, onAddAsNew }: LinkItemDialogProps) {
	const open = lineName !== null
	const list = listName || 'list'
	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !next && onClose()}
			title='Choose Another Item'
			description={lineName ? <>Pick the {listName ?? 'list'} item that <span className='font-mono font-semibold text-foreground'>“{formatItemName(lineName)}”</span> should match.</> : undefined}
			descriptionVariant='body'
			testId='link-item-dialog'
		>
			{open ? (
				<LinkItemForm
					listName={list}
					currentItemId={currentItemId ?? ''}
					items={items}
					onCancel={onClose}
					onLink={onLink}
					onAddAsNew={onAddAsNew}
				/>
			) : null}
		</SheetDialog>
	)
}

interface LinkItemFormProps {
	listName: string
	currentItemId: string
	items: MatchedItem[]
	onCancel: () => void
	onLink: (item: MatchedItem) => void
	onAddAsNew?: () => void
}

function LinkItemForm({ listName, currentItemId, items, onCancel, onLink, onAddAsNew }: LinkItemFormProps) {
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
			className='flex flex-col gap-4 px-0.5 py-1'
		>
			<SearchableChoiceList
				variant='card'
				searchLabel={`Search ${listName}`}
				placeholder={`Search ${listName}`}
				query={query}
				onQueryChange={setQuery}
				options={matches.map(item => ({ value: item.id, label: formatItemName(item.name), note: `In ${listName}` }))}
				value={selected}
				onValueChange={setSelected}
				status={status}
				testId='link-item-list'
			/>
			<div className='flex flex-col gap-2'>
				<Button
					type='submit'
					size='primary'
					disabled={!selected}
				>
					Match to Selected
				</Button>
				<Button
					type='button'
					variant='secondary'
					size='primary'
					onClick={onAddAsNew ?? onCancel}
				>
					{onAddAsNew ? 'Add as New Item' : 'Cancel'}
				</Button>
			</div>
		</form>
	)
}
