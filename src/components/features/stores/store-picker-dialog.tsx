'use client'

import { useId, useMemo, useState, type FormEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { InformationCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { SearchableChoiceList, SheetDialog, type ChoiceOption } from '@/components/commons'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type { Store } from '@/types'

import { canCreateStore, filterStores, pickerStatus } from './helpers/filter-stores'
import { useStores } from './hooks/use-stores'

export type StorePick = { kind: 'existing'; store: Store } | { kind: 'new'; name: string }

const NEW_STORE_VALUE = '__new-store__'
const AUTOMATIC_STORE_VALUE = '__automatic-store__'
const WHOLE_LIST_VALUE = '__whole-list__'

interface StorePickerDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	confirmLabel: string
	/** Offers "Create “…”" for a name no store has. Off when only an existing store makes sense (merging). */
	allowCreate?: boolean
	/** Renders selectable stores as full-width cards, as in the merge destination sheet. */
	optionVariant?: 'default' | 'card'
	/** A store that cannot be picked, such as the one being merged. */
	excludeStoreId?: string | null
	/** Suggested existing store, selected when the sheet opens. */
	initialSelectedStoreId?: string
	/** Text the search starts with, such as the name read from a receipt. */
	initialQuery?: string
	/** Runs the choice; the sheet stays open and shows the pending state until it settles. */
	onPick: (pick: StorePick) => void
	/** Restores the item's receipt-based store choice. */
	onPickAutomatic?: () => void
	pending?: boolean
	/** An error from running the choice, shown above the buttons. */
	error?: string | null
	testId?: string
	/** What is known about the thing the store is picked for (an item): a headline and a line under it, shown above the search. */
	context?: { headline: string; body: string }
	/** A line for each store by id that replaces its receipt count (for example the last price); a store without one reads "Not bought there yet". */
	storeDetails?: Record<string, string>
	/** A closing note under the list. */
	footnote?: string
	/** Uses the compact item-specific picker layout. */
	itemName?: string
	currentUsualStore?: { id: string; name: string; source: 'auto' | 'manual'; note: string }
	/** Adds a whole-list choice and receipt-store item counts for a shopping session. */
	wholeListChoice?: { itemCount: number; storeItemCounts: Record<string, number>; unassignedCount: number }
	onPickWholeList?: () => void
}

/** Chooses one of the user's stores, or names a new one, inside the A1 sheet (search field over a radio list). */
export function StorePickerDialog({ open, onOpenChange, title, description, testId = 'store-picker-dialog', ...props }: StorePickerDialogProps) {
	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !props.pending && onOpenChange(next)}
			title={props.itemName ? 'Usual Store' : title}
			description={props.itemName ? props.footnote : description}
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
	optionVariant = 'default',
	excludeStoreId,
	initialSelectedStoreId,
	initialQuery = '',
	onPick,
	onPickAutomatic,
	pending = false,
	error,
	onCancel,
	context,
	storeDetails,
	footnote,
	itemName,
	currentUsualStore,
	wholeListChoice,
	onPickWholeList,
}: StorePickerBodyProps) {
	const errorId = useId()
	const stores = useStores()
	const [query, setQuery] = useState(initialQuery)
	const [selected, setSelected] = useState('')

	const allStores = useMemo(() => (stores.status === 'ready' ? stores.stores : []), [stores])
	const defaultExistingStoreId = optionVariant === 'card' && !allowCreate
		? allStores.find(store => store.id !== excludeStoreId)?.id
		: undefined
	const defaultStoreId = wholeListChoice
		? [...allStores]
			.filter(store => (wholeListChoice.storeItemCounts[store.id] ?? 0) > 0)
			.sort((a, b) => (wholeListChoice.storeItemCounts[b.id] ?? 0) - (wholeListChoice.storeItemCounts[a.id] ?? 0))[0]?.id
		: undefined
	const initialSelection = currentUsualStore?.source === 'auto'
		? AUTOMATIC_STORE_VALUE
		: currentUsualStore?.id ?? initialSelectedStoreId ?? defaultExistingStoreId ?? defaultStoreId ?? (wholeListChoice ? WHOLE_LIST_VALUE : '')
	const selectedValue = selected || initialSelection
	const matches = useMemo(() => filterStores(allStores, query, excludeStoreId), [allStores, query, excludeStoreId])
	const offerCreate = allowCreate && stores.status === 'ready' && canCreateStore(allStores, query)
	const newName = query.replace(/\s+/g, ' ').trim()
	const choice = selectedValue === NEW_STORE_VALUE && !offerCreate ? '' : selectedValue

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		// React bubbles `submit` through portals: never let this sheet submit a form it is opened from.
		event.stopPropagation()
		if (!choice || pending) return
		if (choice === WHOLE_LIST_VALUE) {
			onPickWholeList?.()
			return
		}
		if (choice === NEW_STORE_VALUE) {
			onPick({ kind: 'new', name: newName })
			return
		}
		if (choice === AUTOMATIC_STORE_VALUE) {
			onPickAutomatic?.()
			return
		}
		const store = allStores.find(item => item.id === choice)
		if (store) onPick({ kind: 'existing', store })
	}

	const options: ChoiceOption[] = [
		...(wholeListChoice ? [{
			value: WHOLE_LIST_VALUE,
			label: 'Whole list',
			note: `All ${allStores.filter(store => (wholeListChoice.storeItemCounts[store.id] ?? 0) > 0).length} stores · ${wholeListChoice.unassignedCount} ${wholeListChoice.unassignedCount === 1 ? 'item has' : 'items have'} no store yet`,
			detail: `${wholeListChoice.itemCount} items`,
		}] : []),
		...(currentUsualStore?.source === 'auto' ? [{
			value: AUTOMATIC_STORE_VALUE,
			label: `Automatic · ${currentUsualStore.name}`,
			note: currentUsualStore.note,
		}] : []),
		...(offerCreate ? [{ value: NEW_STORE_VALUE, label: `Create “${newName}”`, detail: 'New store' }] : []),
		...(wholeListChoice ? allStores.filter(store => (wholeListChoice.storeItemCounts[store.id] ?? 0) > 0) : matches).map(store => ({
			value: store.id,
			label: store.name,
			...(wholeListChoice
				? { note: 'Items you usually buy there', detail: `${wholeListChoice.storeItemCounts[store.id]} ${wholeListChoice.storeItemCounts[store.id] === 1 ? 'item' : 'items'}` }
				: itemName
					? { note: storeDetails?.[store.id] ?? 'Not bought there yet' }
					: { detail: storeDetails
						? (storeDetails[store.id] ?? 'Not bought there yet')
						: `${store.receipt_count} ${store.receipt_count === 1 ? 'receipt' : 'receipts'}` }),
		})),
	]

	const status = pickerStatus({
		total: allStores.length,
		others: allStores.filter(store => store.id !== excludeStoreId).length,
		matches: matches.length,
		allowCreate,
	})
	const visibleStatus = wholeListChoice
		? `${allStores.filter(store => (wholeListChoice.storeItemCounts[store.id] ?? 0) > 0).length} stores found on your receipts`
		: status

	return (
		<form
			data-testid='store-picker-form'
			onSubmit={submit}
			noValidate
			className={itemName ? 'flex h-full min-h-0 flex-col gap-3' : 'flex flex-col gap-4'}
		>
			{itemName ? (
				<div data-testid='store-picker-item' className='flex shrink-0 flex-col gap-1 rounded-2xl bg-muted px-3.5 py-2.5'>
					<span className='text-xs leading-tight font-semibold tracking-wide text-muted-foreground'>ITEM</span>
					<span className='text-sm leading-normal font-semibold text-foreground'>{itemName}</span>
				</div>
			) : context ? (
				<div data-testid='store-picker-context' className='flex flex-col gap-1 rounded-2xl bg-muted px-3.5 py-3'>
					<p className='text-sm font-semibold text-foreground'>{context.headline}</p>
					<p className='text-xs leading-normal text-muted-foreground dark:text-muted-foreground'>{context.body}</p>
				</div>
			) : null}

			<div className={itemName ? 'min-h-0 flex-1 overflow-y-auto' : undefined}>
				{stores.status === 'loading' ? (
				<div
					role='status'
					className='flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground dark:text-muted-foreground'
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
					status={visibleStatus}
					disabled={pending}
					searchable={!itemName && !wholeListChoice}
					variant={itemName || wholeListChoice ? 'card' : optionVariant}
					statusVisibility={wholeListChoice || optionVariant === 'card' ? 'visible' : undefined}
					testId='store-picker-list'
				/>
			)}
			</div>

			{footnote && !itemName ? (
					<Alert
						variant='info'
						role='note'
						data-testid='store-picker-footnote'
						className='items-center'
					>
						<HugeiconsIcon
							icon={InformationCircleIcon}
							strokeWidth={1.8}
							aria-hidden='true'
						/>
						<AlertDescription>{footnote}</AlertDescription>
					</Alert>
				) : null}

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
