'use client'

import { useId, useMemo, useState, type FormEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { ChoiceRow, LoadingState, SheetDialog } from '@/components/commons'
import { filterStores } from '@/components/features/stores/helpers/filter-stores'
import { useStores } from '@/components/features/stores/hooks/use-stores'
import type { StorePick } from '@/components/features/stores'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { createStoreSchema } from '@/lib/validations/store'
import { suggestStoreName } from '@/utils'
import type { Store } from '@/types'

const NEW_STORE_VALUE = '__new-store__'
/** Past this many stores a search field appears over the list; with fewer the whole list fits the sheet. */
const SEARCH_FROM = 6

interface TicketStoreSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** The store name the receipt carries when it matches none of the user's stores; it turns the sheet into "Where was this?". */
	rawName?: string | null
	/** Offers typing the store's name even though the receipt carries none (the read found no store), so the user can name it here. */
	allowNew?: boolean
	/** A store that cannot be picked, such as the one already on the receipt. */
	excludeStoreId?: string | null
	/** The store selected when the sheet opens, such as the one the receipt was read as. */
	initialStoreId?: string | null
	onPick: (pick: StorePick) => void
	pending?: boolean
	error?: string | null
	testId: string
}

/**
 * Chooses one of the user's existing stores for the receipt. An unmatched receipt may still save the name read from its photo.
 */
export function TicketStoreSheet({ open, onOpenChange, rawName = null, allowNew = false, testId, ...props }: TicketStoreSheetProps) {
	const descriptionId = useId()

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !props.pending && onOpenChange(next)}
			title={rawName ? 'Where was this?' : 'Which store?'}
			description={rawName ? `We read “${suggestStoreName(rawName) || rawName}”. It doesn’t match any of your stores yet.` : allowNew ? 'Type the store’s name, or pick one of your stores.' : 'Pick the store this receipt belongs to.'}
			descriptionId={descriptionId}
			testId={testId}
			fit
		>
			{/* Mounted only while open, so every opening starts from the default choice and a fresh read of the stores. */}
			{open ? (
				<TicketStoreForm
					rawName={rawName}
					allowNew={allowNew}
					onCancel={() => onOpenChange(false)}
					{...props}
				/>
			) : null}
		</SheetDialog>
	)
}

type TicketStoreFormProps = Omit<TicketStoreSheetProps, 'open' | 'onOpenChange' | 'testId'> & {
	onCancel: () => void
}

function TicketStoreForm({
	rawName = null,
	allowNew = false,
	excludeStoreId,
	initialStoreId,
	onPick,
	pending = false,
	error,
	onCancel,
}: TicketStoreFormProps) {
	const nameId = useId()
	const nameErrorId = useId()
	const errorId = useId()
	const stores = useStores()
	const [query, setQuery] = useState('')
	const [selected, setSelected] = useState<string | null>(null)
	const [name, setName] = useState(rawName ? suggestStoreName(rawName) || rawName : '')
	const [nameError, setNameError] = useState<string | null>(null)

	const allStores = useMemo(
		() => (stores.status === 'ready' ? stores.stores.filter(store => store.id !== excludeStoreId) : []),
		[stores, excludeStoreId],
	)
	const matches = useMemo(() => filterStores(allStores, query), [allStores, query])

	// Typing a name is the only way forward for someone with no stores yet, so it starts chosen; with stores, the user decides.
	const offerNew = Boolean(rawName) || allowNew
	const defaultChoice = rawName || (allowNew && stores.status === 'ready' && allStores.length === 0)
		? NEW_STORE_VALUE
		: stores.status !== 'ready'
			? ''
			: allStores.some(store => store.id === initialStoreId)
				? (initialStoreId ?? '')
					: ''
	const choice = selected ?? defaultChoice
	const creating = choice === NEW_STORE_VALUE
	const confirmLabel = creating ? 'Save Store' : 'Use This Store'

	const select = (value: string) => {
		setSelected(value)
		setNameError(null)
	}

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		// React bubbles `submit` through portals: never let this sheet submit a form it is opened from.
		event.stopPropagation()
		if (!choice || pending) return
		if (creating) {
			const parsed = createStoreSchema.safeParse({ name })
			if (!parsed.success) {
				setNameError(parsed.error.issues[0]?.message ?? 'Enter a store name')
				return
			}
			onPick({ kind: 'new', name: parsed.data.name })
			return
		}
		const store = allStores.find(item => item.id === choice)
		if (store) onPick({ kind: 'existing', store })
	}

	const newStoreCard = (
		<div
			data-testid='ticket-store-new-option'
			className='flex flex-col gap-2'
		>
			<ChoiceRow
				variant='card'
				testId='ticket-store-new-row'
				selected={creating}
				option={{ value: NEW_STORE_VALUE, label: 'Save as a new store', disabled: pending }}
			/>
			<Label htmlFor={nameId}>Store name</Label>
			<Input
				id={nameId}
				size='lg'
				autoComplete='off'
				maxLength={100}
				value={name}
				onChange={event => {
					setName(event.target.value)
					setNameError(null)
				}}
				onFocus={() => select(NEW_STORE_VALUE)}
				disabled={pending}
				aria-invalid={nameError ? true : undefined}
				aria-describedby={nameError ? nameErrorId : undefined}
			/>
			{nameError ? (
				<p
					id={nameErrorId}
					role='alert'
					className='text-sm text-destructive'
				>
					{nameError}
				</p>
			) : null}
		</div>
	)

	return (
		<form
			data-testid='ticket-store-form'
			onSubmit={submit}
			noValidate
			className='flex flex-col gap-4'
		>
			{stores.status === 'loading' ? (
					<LoadingState testId='ticket-store-loading' label='Loading your stores…' />
			) : stores.status === 'error' ? (
				<div
					data-testid='ticket-store-load-error'
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
						size='lg'
						onClick={stores.retry}
					>
						Try Again
					</Button>
				</div>
			) : (
				<>
					{allStores.length > SEARCH_FROM ? (
						<Input
							type='search'
							size='lg'
							aria-label='Search stores'
							placeholder='Search stores'
							autoComplete='off'
							maxLength={100}
							value={query}
							onChange={event => setQuery(event.target.value)}
							disabled={pending}
						/>
					) : null}
					<RadioGroup
						aria-label='Store'
						value={choice}
						onValueChange={select}
						disabled={pending}
						spacing='snug'
					>
						{offerNew ? (
							<>
								{newStoreCard}
								{matches.length > 0 ? (
									<span className='text-xs text-muted-foreground'>Or it’s one of your stores</span>
								) : null}
							</>
						) : null}
						{matches.map(store => (
							<StoreRow
								key={store.id}
								store={store}
								selected={choice === store.id}
							/>
						))}
						{allStores.length > 0 && matches.length === 0 ? (
							<p
								role='status'
								className='py-2 text-sm text-muted-foreground'
							>
								No store matches this search.
							</p>
						) : null}
					</RadioGroup>
				</>
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
					variant='outline'
					size='lg'
					disabled={pending}
					onClick={onCancel}
				>
					{rawName ? 'Skip for Now' : 'Cancel'}
				</Button>
				<Button
					type='submit'
					size='lg'
					disabled={!choice || pending || stores.status !== 'ready'}
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

interface StoreRowProps {
	store: Store
	selected: boolean
}

function StoreRow({ store, selected }: StoreRowProps) {
	return (
		<ChoiceRow
			variant='card'
			testId={`ticket-store-option-${store.id}`}
			selected={selected}
			option={{
				value: store.id,
				label: store.name,
				detail: `${store.receipt_count} ${store.receipt_count === 1 ? 'receipt' : 'receipts'}`,
				detailTone: 'muted',
			}}
		/>
	)
}
