'use client'

import { useId, useMemo, useState, type FormEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { ChoiceRow, SheetDialog } from '@/components/commons'
import { filterStores } from '@/components/features/stores/helpers/filter-stores'
import { useStores } from '@/components/features/stores/hooks/use-stores'
import { suggestStoreName, type StorePick } from '@/components/features/stores'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createStoreSchema } from '@/lib/validations/store'
import type { Store } from '@/types'

const NEW_STORE_VALUE = '__new-store__'
/** Past this many stores a search field appears over the list; with fewer the whole list fits the sheet. */
const SEARCH_FROM = 6

interface TicketStoreSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** The store name the receipt carries when it matches none of the user's stores; it turns the sheet into "Where was this?". */
	rawName?: string | null
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
 * Where the receipt was bought, in one sheet: one of the user's stores or a new one. A receipt whose name matches none of the
 * stores ("Where was this?") offers saving that name first; every other case ("Which store?") lists the stores and ends with
 * "Add a New Store".
 */
export function TicketStoreSheet({ open, onOpenChange, rawName = null, testId, ...props }: TicketStoreSheetProps) {
	const descriptionId = useId()

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !props.pending && onOpenChange(next)}
			title={rawName ? 'Where was this?' : 'Which store?'}
			ariaDescribedBy={descriptionId}
			testId={testId}
			fit
		>
			{/* Mounted only while open, so every opening starts from the default choice and a fresh read of the stores. */}
			{open ? (
				<TicketStoreForm
					descriptionId={descriptionId}
					rawName={rawName}
					onCancel={() => onOpenChange(false)}
					{...props}
				/>
			) : null}
		</SheetDialog>
	)
}

type TicketStoreFormProps = Omit<TicketStoreSheetProps, 'open' | 'onOpenChange' | 'testId'> & {
	descriptionId: string
	onCancel: () => void
}

function TicketStoreForm({
	descriptionId,
	rawName = null,
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

	const defaultChoice = rawName
		? NEW_STORE_VALUE
		: stores.status !== 'ready'
			? ''
			: allStores.some(store => store.id === initialStoreId)
				? (initialStoreId ?? '')
				: allStores.length === 0
					? NEW_STORE_VALUE
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
			className={`flex flex-col gap-2.5 rounded-2xl px-3.5 py-3 ${creating ? 'bg-blue-50 ring-2 ring-primary ring-inset' : 'border border-slate-200 bg-card dark:border-border'}`}
		>
			<label className='flex cursor-pointer items-center gap-3'>
				<RadioGroupItem
					value={NEW_STORE_VALUE}
					size='ring'
					disabled={pending}
				/>
				<span className='text-sm leading-[1.3] font-semibold'>{rawName ? 'Save as a new store' : 'Add a New Store'}</span>
			</label>
			<label
				htmlFor={nameId}
				className='pl-8 text-xs leading-[1.4] text-slate-500'
			>
				Store name
			</label>
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
				className='ml-8 w-[calc(100%-2rem)]'
			/>
			{nameError ? (
				<p
					id={nameErrorId}
					role='alert'
					className='pl-8 text-xs font-medium text-destructive'
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
			<p
				id={descriptionId}
				className='text-sm leading-normal text-slate-600 dark:text-muted-foreground'
			>
				{rawName ? (
					<>
						We read <span className='font-mono font-semibold text-foreground'>“{rawName}”</span>. It doesn’t match any of your stores yet.
					</>
				) : (
					'Pick the store this receipt belongs to.'
				)}
			</p>

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
						size='primary'
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
						{rawName ? (
							<>
								{newStoreCard}
								{matches.length > 0 ? (
									<span className='px-0.5 pt-1 text-xs leading-[1.4] text-slate-500'>Or it’s one of your stores</span>
								) : null}
							</>
						) : null}
						{matches.map(store => (
							<StoreRow
								key={store.id}
								store={store}
								inline={rawName !== null}
							/>
						))}
						{allStores.length > 0 && matches.length === 0 ? (
							<p
								role='status'
								className='py-2 text-sm text-slate-500'
							>
								No store matches this search.
							</p>
						) : null}
						{rawName ? null : creating ? (
							newStoreCard
						) : (
							<Button
								type='button'
								variant='dotted-option'
								size='option'
								rounded='2xl'
								disabled={pending}
								onClick={() => select(NEW_STORE_VALUE)}
								data-testid='ticket-store-add-new'
							>
								<span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100'>
									<HugeiconsIcon
										icon={Add01Icon}
										strokeWidth={2.4}
										aria-hidden='true'
										className='size-3'
									/>
								</span>
								<span className='flex min-w-0 flex-1 flex-col gap-1'>
									<span className='text-sm leading-[1.3] font-semibold'>Add a New Store</span>
									<span className='text-xs leading-[1.4] font-normal text-slate-500'>Create a store for these items</span>
								</span>
							</Button>
						)}
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
					variant='secondary'
					size='primary'
					disabled={pending}
					onClick={onCancel}
				>
					{rawName ? 'Skip for Now' : 'Cancel'}
				</Button>
				<Button
					type='submit'
					size='primary'
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
	/** The receipt count sits at the end of the title's row instead of under it. */
	inline: boolean
}

function StoreRow({ store, inline }: StoreRowProps) {
	const count = (
		<span className='font-sans text-sm leading-tight text-slate-600'>
			<b className='font-mono text-base leading-[1.2] font-bold text-foreground tabular-nums'>{store.receipt_count}</b>{' '}
			{store.receipt_count === 1 ? 'receipt' : 'receipts'}
		</span>
	)

	return (
		<ChoiceRow
			variant='card'
			testId={`ticket-store-option-${store.id}`}
			option={{ value: store.id, label: store.name, ...(inline ? { detail: count } : { note: count }) }}
		/>
	)
}
