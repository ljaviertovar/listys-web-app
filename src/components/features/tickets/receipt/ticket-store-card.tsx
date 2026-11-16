'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Delete02Icon, Edit02Icon, Loading03Icon, Store03Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { RowIcon, RowMenu } from '@/components/commons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
	itemsFound?: boolean
}

/**
 * Where the receipt was bought, under the photo and beside the items: a store to confirm with one tap, a raw name to
 * save as a new store, or a store to choose. Optional: nothing else on the receipt waits for it.
 */
export function TicketStoreCard({ ticketId, store, storeSuggestion, storeName, itemsFound = true }: Props) {
	const state = getTicketStoreState({ store, store_suggestion: storeSuggestion, store_name: storeName })
	const actions = useTicketStore(ticketId)
	const busy = actions.pending !== null
	const sheetOpen = actions.pickerOpen || actions.saveOpen
	const storeActionsMenu = state.kind === 'confirmed'

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
			detail = <p className='text-sm leading-5 text-muted-foreground'>Store · Confirmed for this receipt.</p>
			actionsRow = null
			break
		case 'suggested':
			title = state.store.name
			chip = (
				<Badge variant='outline'>
					<HugeiconsIcon icon={Store03Icon} strokeWidth={1.7} aria-hidden='true' />
					One of your stores
				</Badge>
			)
			detail = <RawName name={state.rawName} />
			actionsRow = (
				<>
					<Button type='button' variant='secondary' size='lg' disabled={busy} onClick={actions.openPicker}>
						Change Store
					</Button>
					<Button type='button' size='lg' disabled={busy} onClick={() => actions.confirm(state.store.id)}>
						{actions.pending === 'confirm' ? spinner : <HugeiconsIcon icon={Tick02Icon} strokeWidth={1.8} aria-hidden='true' className='size-4.5' />}
						Confirm
					</Button>
				</>
			)
			break
		case 'unmatched':
			title = state.rawName
			detail = <p className='text-sm leading-5 text-muted-foreground'>This store isn’t in My Stores yet.</p>
			actionsRow = (
				<>
					<Button type='button' variant='secondary' size='lg' disabled={busy} onClick={actions.openPicker}>
						Change Store
					</Button>
					<Button type='button' size='lg' disabled={busy} onClick={actions.openSave}>
						Save as New Store
					</Button>
				</>
			)
			break
		case 'unrecognized':
			title = 'Store not found on the receipt'
			detail = (
				<p className='text-sm leading-5 text-muted-foreground'>
					{itemsFound
						? 'The items were read fine. Pick the store so prices and tags land in the right place.'
						: 'We couldn’t read the store name. Choose it if you recognize the store.'}
				</p>
			)
			actionsRow = (
				<Button type='button' variant='secondary' size='lg' className='col-span-2' disabled={busy} onClick={actions.openPicker}>
					Choose Store
				</Button>
			)
			break
	}

	// "Where was this?" is for a name that matches none of the user's stores; both of its buttons open it.
	const rawName = state.kind === 'unmatched' ? state.rawName : null
	if (state.kind === 'unrecognized') {
		return (
			<Alert
				variant='warning'
				role='region'
				data-testid='ticket-store-card'
				data-state={state.kind}
				aria-labelledby={`${ticketId}-store-title`}
			>
				<RowIcon icon={Alert02Icon} tone='warning' size='alert' testId='ticket-store-icon' />
				<div className='flex min-w-0 flex-col gap-0.5'>
					<AlertTitle id={`${ticketId}-store-title`}>Store not set</AlertTitle>
					<AlertDescription>Prices and usual-store tags are not saved until you choose one.</AlertDescription>
				</div>
				{actions.error && !sheetOpen ? (
					<div className='col-span-2 flex flex-col items-start gap-2'>
						<p role='alert' className='text-sm text-destructive'>{actions.error}</p>
						{actions.canRetry ? (
							<Button type='button' variant='secondary' size='lg' disabled={busy} onClick={actions.retry}>
								{actions.pending === 'retry' ? spinner : null}
								Try Again
							</Button>
						) : null}
					</div>
				) : null}
				<Button type='button' size='lg' className='col-span-2 w-full' disabled={busy} onClick={actions.openPicker}>
					{busy ? spinner : null}
					Choose Store
				</Button>
				<TicketStoreSheet
					open={sheetOpen}
					onOpenChange={open => (open ? actions.openPicker() : actions.closeDialogs())}
					rawName={null}
					excludeStoreId={null}
					initialStoreId={null}
					onPick={actions.pick}
					pending={actions.pending === 'pick'}
					error={sheetOpen ? actions.error : null}
					testId='ticket-store-sheet'
				/>
			</Alert>
		)
	}

	return (
		<Card
			size='receipt'
			role='region'
			data-testid='ticket-store-card'
			data-state={state.kind}
			aria-labelledby={`${ticketId}-store-title`}
		>
			<div className='flex flex-col gap-2'>
				<div className='flex items-center gap-3'>
					<RowIcon
						icon={Store03Icon}
						tone='store'
						size='lg'
					/>
					<div className={state.kind === 'confirmed' ? 'flex min-w-0 flex-1 flex-col gap-0.5' : 'flex min-w-0 flex-1 flex-col gap-1'}>
						<div className='relative flex min-w-0 items-center gap-2'>
							<h2
								id={`${ticketId}-store-title`}
								className={`min-w-0 flex-1 font-display text-base leading-normal font-semibold break-words ${storeActionsMenu ? 'pr-12' : ''}`}
							>
								{title}
							</h2>
							{chip}
							{storeActionsMenu ? (
								<RowMenu
									label={`More store actions for ${title}`}
									disabled={busy}
									testId='ticket-store-actions-menu'
									className='absolute right-0 top-1/2 -translate-y-1/2'
									actions={[
										{ label: 'Change Store', icon: Edit02Icon, onSelect: actions.openPicker, disabled: busy },
										{ label: 'Remove Store', icon: Delete02Icon, onSelect: actions.remove, tone: 'danger', separatorBefore: true, disabled: busy },
									]}
								/>
							) : null}
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
							<Button type='button' variant='secondary' size='lg' disabled={busy} onClick={actions.retry}>
								{actions.pending === 'retry' ? spinner : null}
								Try Again
							</Button>
						) : null}
					</div>
				) : null}

				{!storeActionsMenu ? <div className='grid grid-cols-2 gap-2'>{actionsRow}</div> : null}

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
	return <span className='truncate font-mono text-xs leading-4 font-medium text-muted-foreground'>Read as “{name}”</span>
}
