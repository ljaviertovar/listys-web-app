'use client'

import { useReducer } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TicketStatusChip } from '@/components/features/tickets/ticket-status-chip'
import { UploadTicketDialog } from '@/components/features/tickets'
import { useTicketStatus } from '@/components/features/tickets/receipt/hooks/use-ticket-status'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'

import { AddReceiptSheet } from './add-receipt-sheet'
import { ChooseUploadedReceiptSheet } from './choose-uploaded-receipt-sheet'
import type { TripReceiptState } from './helpers/get-trip-receipt-state'
import { getTripReceiptCard } from './helpers/get-trip-receipt-card'
import { createTripReceiptFlow, shouldOpenAddOnLoad, tripReceiptFlowReducer } from './helpers/trip-receipt-flow'
import { useAvailableReceipts } from './hooks/use-available-receipts'
import { TripReceiptReview } from './trip-receipt-review'

interface TripReceiptsCardProps {
	/** Where the trip stands with its receipt; a trip with an attached receipt does not render this card. */
	state: Exclude<TripReceiptState, { kind: 'attached' }>
	/** True on the visit that follows completing the trip: the card then confirms the save and asks for the receipt. */
	justSaved?: boolean
	/** Items the trip saved, and the list they went to. */
	itemCount: number
	listName: string
	/** The trip as the review needs it. Omitted when the viewer did not run the trip: they are told the state and offered nothing. */
	trip?: TicketSessionCandidate
	/** Opens the Add Receipt choice on arrival, for the link of a trip card that already said the user wants to add one. */
	openAddOnLoad?: boolean
}

/**
 * A completed trip with no receipt attached. Having no receipt never makes the trip incomplete: this card only says where the
 * receipt stands (none yet, being read, ready, unreadable) and offers the next step. Attaching is confirmed in the review,
 * which opens from here only once a receipt is chosen or read.
 */
export function TripReceiptsCard({ state, justSaved = false, itemCount, listName, trip, openAddOnLoad = false }: TripReceiptsCardProps) {
	const canManage = Boolean(trip)
	const [flow, dispatch] = useReducer(
		tripReceiptFlowReducer,
		shouldOpenAddOnLoad({ requested: openAddOnLoad, canManage, state }),
		createTripReceiptFlow,
	)

	// Right after saving, "Choose Uploaded Receipt" only appears when there is something to choose.
	const available = useAvailableReceipts(trip?.id ?? '', canManage && justSaved && state.kind === 'none')
	const hasAvailableReceipts = available.state.status === 'ready' && available.state.receipts.some(receipt => receipt.selectable)

	const card = getTripReceiptCard({ state, justSaved, canManage, itemCount, listName, hasAvailableReceipts })
	const cardState = state.kind === 'none' ? (justSaved ? 'saved' : 'no-receipt') : state.kind

	const uploadNew = () => dispatch({ type: 'upload-new' })
	const chooseUploaded = () => dispatch({ type: 'choose-uploaded' })
	const review = (ticketId: string) => dispatch({ type: 'review', ticketId })

	return (
		<Card size='tight' data-testid='trip-receipts-card' data-state={cardState}>
			<div className='flex flex-col gap-3'>
				<div className='flex min-w-0 flex-col gap-1'>
					<div className='flex flex-wrap items-center gap-2'>
						<h2 className='font-display text-base leading-[1.5] font-semibold'>{card.title}</h2>
						{state.kind === 'reading' ? <TripReceiptReadingChip ticketId={state.ticketId} /> : null}
					</div>
					<p className='text-sm leading-normal text-muted-foreground'>{card.message}</p>
				</div>

				{card.actions.length > 0 ? (
					<div className='flex flex-col gap-2 sm:flex-row'>
						{card.actions.map(action => {
							switch (action) {
								case 'add-receipt':
									return <Button key={action} type='button' size='primary' className='sm:w-auto' onClick={() => dispatch({ type: 'open-add' })}>Add Receipt</Button>
								case 'upload':
									return <Button key={action} type='button' size='primary' className='sm:w-auto' onClick={uploadNew}>Upload a Receipt</Button>
								case 'choose':
									return <Button key={action} type='button' variant='secondary' size='primary' className='sm:w-auto' onClick={chooseUploaded}>Choose Uploaded Receipt</Button>
								case 'review':
									return state.kind === 'read' ? (
										<Button key={action} type='button' size='primary' className='sm:w-auto' onClick={() => review(state.ticketId)}>Review Receipt</Button>
									) : null
								case 'open-receipt':
									return state.kind === 'failed' ? (
										<Button key={action} asChild variant='secondary' size='primary' className='sm:w-auto'>
											<Link href={`/tickets/${state.ticketId}`}>Open Receipt</Link>
										</Button>
									) : null
								case 'keep-separate':
									return (
										<Button key={action} asChild variant='secondary' size='primary' className='sm:w-auto'>
											<Link href='/dashboard'>Keep It Separate</Link>
										</Button>
									)
							}
						})}
					</div>
				) : null}
			</div>

			{trip ? (
				<>
					<AddReceiptSheet open={flow.add} onOpenChange={open => dispatch({ type: 'set-add', open })} onUploadNew={uploadNew} onChooseUploaded={chooseUploaded} />
					<UploadTicketDialog trigger={null} open={flow.upload} onOpenChange={open => dispatch({ type: 'set-upload', open })} shoppingSessionId={trip.id} />
					<ChooseUploadedReceiptSheet sessionId={trip.id} open={flow.choose} onOpenChange={open => dispatch({ type: 'set-choose', open })} onChoose={review} onUploadNew={uploadNew} />
					{flow.reviewTicketId ? <TripReceiptReview key={flow.reviewTicketId} ticketId={flow.reviewTicketId} trip={trip} onClose={() => dispatch({ type: 'close-review' })} /> : null}
				</>
			) : null}
		</Card>
	)
}

/** The reading status of the receipt just uploaded; the trip refreshes by itself when the reading ends, read or failed. */
function TripReceiptReadingChip({ ticketId }: { ticketId: string }) {
	const router = useRouter()
	const status = useTicketStatus({ ticketId, initialStatus: 'processing', onTerminal: () => router.refresh() })
	return (
		<span role='status' aria-live='polite' data-testid='trip-receipt-reading-status'>
			<TicketStatusChip status={status} testId='trip-receipt-status-chip' />
		</span>
	)
}
