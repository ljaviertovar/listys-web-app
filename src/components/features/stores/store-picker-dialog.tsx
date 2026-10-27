'use client'

import { useId, useMemo, useState, type FormEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { SearchableChoiceList, SheetDialog, type ChoiceOption } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type { Store } from '@/types'

import { canCreateStore, filterStores, pickerStatus } from './helpers/filter-stores'
import { useStores } from './hooks/use-stores'

export type StorePick = { kind: 'existing'; store: Store } | { kind: 'new'; name: string }

const NEW_STORE_VALUE = '__new-store__'

interface StorePickerDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	confirmLabel: string
	/** Offers "Create “…”" for a name no store has. Off when only an existing store makes sense (merging). */
	allowCreate?: boolean
	/** A store that cannot be picked, such as the one being merged. */
	excludeStoreId?: string | null
	/** Text the search starts with, such as the name read from a receipt. */
	initialQuery?: string
	/** Runs the choice; the sheet stays open and shows the pending state until it settles. */
	onPick: (pick: StorePick) => void
	pending?: boolean
	/** An error from running the choice, shown above the buttons. */
	error?: string | null
	testId?: string
}

/** Chooses one of the user's stores, or names a new one, inside the A1 sheet (search field over a radio list). */
export function StorePickerDialog({ open, onOpenChange, title, description, testId = 'store-picker-dialog', ...props }: StorePickerDialogProps) {
	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !props.pending && onOpenChange(next)}
			title={title}
			description={description}
			testId={testId}
		>
			{/* Mounted only while open, so every opening starts from the initial search and a fresh read of the stores. */}
			{open ? (
				<StorePickerBody
					onCancel={() => onOpenChange(false)}
					{...props}
				/>
			) : null}
		</SheetDialog>
	)
}

type StorePickerBodyProps = Omit<StorePickerDialogProps, 'open' | 'onOpenChange' | 'title' | 'description' | 'testId'> & {
	onCancel: () => void
}

function StorePickerBody({
	confirmLabel,
	allowCreate = true,
	excludeStoreId,
	initialQuery = '',
	onPick,
	pending = false,
	error,
	onCancel,
}: StorePickerBodyProps) {
	const errorId = useId()
	const stores = useStores()
	const [query, setQuery] = useState(initialQuery)
	const [selected, setSelected] = useState('')

	const allStores = useMemo(() => (stores.status === 'ready' ? stores.stores : []), [stores])
	const matches = useMemo(() => filterStores(allStores, query, excludeStoreId), [allStores, query, excludeStoreId])
	const offerCreate = allowCreate && stores.status === 'ready' && canCreateStore(allStores, query)
	const newName = query.replace(/\s+/g, ' ').trim()
	const choice = selected === NEW_STORE_VALUE && !offerCreate ? '' : selected

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		// React bubbles `submit` through portals: never let this sheet submit a form it is opened from.
		event.stopPropagation()
		if (!choice || pending) return
		if (choice === NEW_STORE_VALUE) {
			onPick({ kind: 'new', name: newName })
			return
		}
		const store = allStores.find(item => item.id === choice)
		if (store) onPick({ kind: 'existing', store })
	}

	const options: ChoiceOption[] = [
		...(offerCreate ? [{ value: NEW_STORE_VALUE, label: `Create “${newName}”`, detail: 'New store' }] : []),
		...matches.map(store => ({
			value: store.id,
			label: store.name,
			detail: `${store.receipt_count} ${store.receipt_count === 1 ? 'receipt' : 'receipts'}`,
		})),
	]

	const status = pickerStatus({
		total: allStores.length,
		others: allStores.filter(store => store.id !== excludeStoreId).length,
		matches: matches.length,
		allowCreate,
	})

	return (
		<form
			data-testid='store-picker-form'
			onSubmit={submit}
			noValidate
			className='flex flex-col gap-4'
		>
			{stores.status === 'loading' ? (
				<div
					role='status'
					className='flex items-center justify-center gap-2 py-6 text-sm text-slate-500 dark:text-muted-foreground'
				>
					<HugeiconsIcon
						icon={Loading03Icon}
						strokeWidth={2}
						aria-hidden='true'
						className='size-5 animate-spin motion-reduce:animate-none'
					/>
					Loading your stores…
				</div>
			) : stores.status === 'error' ? (
				<div
					data-testid='store-picker-load-error'
					className='flex flex-col items-center gap-3 py-4 text-center'
				>
					<p
						role='alert'
						className='text-sm text-destructive'
					>
						We couldn’t load your stores.
					</p>
					<Button
						type='button'
						variant='secondary'
						size='primary'
						onClick={stores.retry}
					>
						Try Again
					</Button>
				</div>
			) : (
				<SearchableChoiceList
					searchLabel={allowCreate ? 'Search or name a store' : 'Search stores'}
					placeholder={allowCreate ? 'e.g. No Frills' : 'Store name'}
					query={query}
					onQueryChange={setQuery}
					options={options}
					value={choice}
					onValueChange={setSelected}
					status={status}
					disabled={pending}
					testId='store-picker-list'
				/>
			)}

			{error ? (
				<p
					id={errorId}
					role='alert'
					className='text-sm text-destructive'
				>
					{error}
				</p>
			) : null}

			<DialogFooter variant='sheet'>
				<Button
					type='button'
					variant='secondary'
					size='primary'
					disabled={pending}
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type='submit'
					size='primary'
					disabled={!choice || pending}
					aria-describedby={error ? errorId : undefined}
				>
					{pending ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 animate-spin motion-reduce:animate-none'
						/>
					) : null}
					{confirmLabel}
				</Button>
			</DialogFooter>
		</form>
	)
}
