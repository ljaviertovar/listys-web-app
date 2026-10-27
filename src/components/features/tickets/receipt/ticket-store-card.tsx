'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, Store01Icon } from '@hugeicons/core-free-icons'

import { StoreNameDialog, StorePickerDialog, suggestStoreName } from '@/components/features/stores'
import { Button } from '@/components/ui/button'
import type { StoreRef } from '@/types'

import { getTicketStoreState } from './helpers/ticket-store-actions'
import { useTicketStore } from './hooks/use-ticket-store'

interface Props {
	ticketId: string
	/** The confirmed store, the store the raw name resolves to, and the raw name itself, as the receipt read returns them. */
	store: StoreRef | null
	storeSuggestion: StoreRef | null
	storeName: string | null
}

/**
 * Where the receipt was bought, under the photo and beside the items: a store to confirm with one tap, a raw name to
 * save as a new store, or a store to choose. Optional: nothing else on the receipt waits for it.
 */
export function TicketStoreCard({ ticketId, store, storeSuggestion, storeName }: Props) {
	const state = getTicketStoreState({ store, store_suggestion: storeSuggestion, store_name: storeName })
	const actions = useTicketStore(ticketId)
	const busy = actions.pending !== null
	const dialogOpen = actions.pickerOpen || actions.saveOpen

	const spinner = (
		<HugeiconsIcon
			icon={Loading03Icon}
			strokeWidth={2}
			aria-hidden='true'
			className='size-4 animate-spin motion-reduce:animate-none'
		/>
	)

	let title: string
	let detail: ReactNode
	let primary: ReactNode = null
	let secondary: ReactNode

	switch (state.kind) {
		case 'confirmed':
			title = state.store.name
			detail = 'Confirmed for this receipt.'
			secondary = (
				<>
					<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.openPicker}>
						Choose Another Store
					</Button>
					<Button type='button' variant='quiet' size='primary' disabled={busy} onClick={actions.remove}>
						{actions.pending === 'remove' ? spinner : null}
						Remove Store
					</Button>
				</>
			)
			break
		case 'suggested':
			title = state.store.name
			detail = (
				<>
					Matches <span className='font-medium text-foreground'>“{state.rawName}”</span> on the receipt.
				</>
			)
			primary = (
				<Button type='button' size='primary' disabled={busy} onClick={() => actions.confirm(state.store.id)}>
					{actions.pending === 'confirm' ? spinner : null}
					Confirm
				</Button>
			)
			secondary = (
				<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.openPicker}>
					Choose Another Store
				</Button>
			)
			break
		case 'unmatched':
			title = state.rawName
			detail = 'This store isn’t in My Stores yet.'
			primary = (
				<Button type='button' size='primary' disabled={busy} onClick={actions.openSave}>
					Save as New Store
				</Button>
			)
			secondary = (
				<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.openPicker}>
					Choose Another Store
				</Button>
			)
			break
		case 'unrecognized':
			title = 'Store not recognized'
			detail = 'We couldn’t read the store on this receipt.'
			primary = (
				<Button type='button' size='primary' disabled={busy} onClick={actions.openPicker}>
					Choose a Store
				</Button>
			)
			break
	}

	return (
		<section
			data-testid='ticket-store-card'
			data-state={state.kind}
			aria-labelledby={`${ticketId}-store-title`}
			className='flex flex-col gap-3 rounded-3xl bg-card p-3 shadow-card md:p-4'
		>
			<div className='flex items-start gap-3'>
				<span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'>
					<HugeiconsIcon
						icon={Store01Icon}
						strokeWidth={1.5}
						aria-hidden='true'
						className='size-4.5'
					/>
				</span>
				<div className='flex min-w-0 flex-1 flex-col'>
					<span className='text-xs font-medium text-slate-500 dark:text-muted-foreground'>Store</span>
					<h2
						id={`${ticketId}-store-title`}
						className='break-words font-display text-base leading-[1.5] font-semibold'
					>
						{title}
					</h2>
					<p className='text-sm leading-normal text-slate-500 dark:text-muted-foreground'>{detail}</p>
				</div>
			</div>

			{actions.error && !dialogOpen ? (
				<div className='flex flex-col items-start gap-2'>
					<p
						role='alert'
						className='text-sm text-destructive'
					>
						{actions.error}
					</p>
					{actions.canRetry ? (
						<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.retry}>
							{actions.pending === 'retry' ? spinner : null}
							Try Again
						</Button>
					) : null}
				</div>
			) : null}

			<div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap'>
				{primary}
				{secondary}
			</div>
			{state.kind !== 'confirmed' ? (
				<p className='text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
					Optional. You can add items to a list without it.
				</p>
			) : null}

			<StorePickerDialog
				open={actions.pickerOpen}
				onOpenChange={open => (open ? actions.openPicker() : actions.closeDialogs())}
				title={state.kind === 'unrecognized' ? 'Choose a Store' : 'Choose Another Store'}
				description='Pick one of your stores, or type a name to create one.'
				confirmLabel='Use This Store'
				excludeStoreId={state.kind === 'confirmed' ? state.store.id : null}
				onPick={actions.pick}
				pending={actions.pending === 'pick'}
				error={actions.pickerOpen ? actions.error : null}
				testId='ticket-store-picker'
			/>
			{state.kind === 'unmatched' ? (
				<StoreNameDialog
					open={actions.saveOpen}
					onOpenChange={open => (open ? actions.openSave() : actions.closeDialogs())}
					title='Save as New Store'
					description={`We suggest a name from “${state.rawName}”. You can change it.`}
					initialName={suggestStoreName(state.rawName) || state.rawName}
					confirmLabel='Save Store'
					onSubmit={actions.saveNew}
					pending={actions.pending === 'save'}
					error={actions.saveOpen ? actions.error : null}
					testId='ticket-store-save-dialog'
				/>
			) : null}
		</section>
	)
}
