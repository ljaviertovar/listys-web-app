'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading03Icon, Store03Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { StoreRef } from '@/types'

import { getTicketStoreState } from './helpers/ticket-store-actions'
import { useTicketStore } from './hooks/use-ticket-store'
import { TicketStoreSheet } from './ticket-store-sheet'

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
	const sheetOpen = actions.pickerOpen || actions.saveOpen

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
	let chip: ReactNode = null
	let actionsRow: ReactNode

	switch (state.kind) {
		case 'confirmed':
			title = state.store.name
			detail = <p className='text-sm leading-[1.4] text-slate-600 dark:text-muted-foreground'>Confirmed for this receipt.</p>
			actionsRow = (
				<>
					<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.openPicker}>
						Change Store
					</Button>
					<Button type='button' variant='destructive-soft' size='primary' disabled={busy} onClick={actions.remove}>
						{actions.pending === 'remove' ? spinner : null}
						Remove Store
					</Button>
				</>
			)
			break
		case 'suggested':
			title = state.store.name
			chip = (
				<Badge variant='tag'>
					<HugeiconsIcon icon={Store03Icon} strokeWidth={1.7} aria-hidden='true' />
					One of your stores
				</Badge>
			)
			detail = <RawName name={state.rawName} />
			actionsRow = (
				<>
					<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.openPicker}>
						Change Store
					</Button>
					<Button type='button' size='primary' disabled={busy} onClick={() => actions.confirm(state.store.id)}>
						{actions.pending === 'confirm' ? spinner : <HugeiconsIcon icon={Tick02Icon} strokeWidth={1.8} aria-hidden='true' className='size-4.5' />}
						Confirm
					</Button>
				</>
			)
			break
		case 'unmatched':
			title = state.rawName
			detail = <p className='text-sm leading-[1.4] text-slate-600 dark:text-muted-foreground'>This store isn’t in My Stores yet.</p>
			actionsRow = (
				<>
					<Button type='button' variant='secondary' size='primary' disabled={busy} onClick={actions.openPicker}>
						Change Store
					</Button>
					<Button type='button' size='primary' disabled={busy} onClick={actions.openSave}>
						Save as New Store
					</Button>
				</>
			)
			break
		case 'unrecognized':
			title = 'Store not found on the receipt'
			detail = (
				<p className='text-xs leading-[1.4] text-slate-500 dark:text-muted-foreground'>
					The items were read fine. Pick the store so prices and tags land in the right place.
				</p>
			)
			actionsRow = (
				<Button type='button' variant='secondary' size='primary' className='col-span-2' disabled={busy} onClick={actions.openPicker}>
					Choose Store
				</Button>
			)
			break
	}

	// "Where was this?" is for a name that matches none of the user's stores; both of its buttons open it.
	const rawName = state.kind === 'unmatched' ? state.rawName : null

	return (
		<Card
			size='tight'
			role='region'
			data-testid='ticket-store-card'
			data-state={state.kind}
			aria-labelledby={`${ticketId}-store-title`}
		>
			<div className='flex flex-col gap-3'>
				<span className='text-xs leading-[1.25] font-semibold tracking-[0.04em] text-slate-500 uppercase dark:text-muted-foreground'>
					Store
				</span>
				<div className='flex items-center gap-3'>
					<RowIcon
						icon={state.kind === 'unrecognized' ? Alert02Icon : Store03Icon}
						tone={state.kind === 'unrecognized' ? 'warning' : 'store'}
						size='lg'
					/>
					<div className={state.kind === 'confirmed' ? 'flex min-w-0 flex-1 flex-col gap-0.5' : 'flex min-w-0 flex-1 flex-col gap-1'}>
						<div className='flex items-center gap-2'>
							<h2
								id={`${ticketId}-store-title`}
								className='min-w-0 font-display text-base leading-normal font-semibold tracking-[-0.005em] break-words'
							>
								{title}
							</h2>
							{chip}
						</div>
						{detail}
					</div>
				</div>

				{actions.error && !sheetOpen ? (
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

				<div className='grid grid-cols-2 gap-2'>{actionsRow}</div>

				<TicketStoreSheet
					open={sheetOpen}
					onOpenChange={open => (open ? actions.openPicker() : actions.closeDialogs())}
					rawName={rawName}
					excludeStoreId={state.kind === 'confirmed' ? state.store.id : null}
					initialStoreId={state.kind === 'suggested' ? state.store.id : null}
					onPick={actions.pick}
					pending={actions.pending === 'pick'}
					error={sheetOpen ? actions.error : null}
					testId='ticket-store-sheet'
				/>
			</div>
		</Card>
	)
}

function RawName({ name }: { name: string }) {
	return <span className='truncate font-mono text-xs leading-[1.3] font-medium text-slate-500 dark:text-muted-foreground'>Read as “{name}”</span>
}
