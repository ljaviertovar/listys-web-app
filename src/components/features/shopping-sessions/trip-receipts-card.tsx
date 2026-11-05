'use client'

import { useEffect, useReducer } from 'react'
import Link from 'next/link'
import { Alert02Icon, Attachment01Icon, CheckmarkCircle02Icon, Loading03Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons'

import { RowIcon, StatusCard } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UploadTicketDialog } from '@/components/features/tickets'
import type { TicketSessionCandidate } from '@/lib/api/endpoints'

import type { TripReceiptState } from './helpers/get-trip-receipt-state'
import { getTripReceiptCard } from './helpers/get-trip-receipt-card'
import { createTripReceiptFlow, tripReceiptFlowReducer } from './helpers/trip-receipt-flow'
import { TripReceiptReview } from './trip-receipt-review'
import { TripReceiptReadingListener } from './trip-receipt-reading-listener'

interface TripReceiptsCardProps {
	state: Exclude<TripReceiptState, { kind: 'attached' }>
	justSaved?: boolean
	itemCount: number
	listName: string
	trip?: TicketSessionCandidate
	/** Legacy link from Trips now focuses the direct upload card, without opening a sheet. */
	openAddOnLoad?: boolean
	testId?: string
}

export function TripReceiptsCard({ state, justSaved = false, itemCount, listName, trip, openAddOnLoad = false, testId = 'trip-receipts-card' }: TripReceiptsCardProps) {
	const canManage = Boolean(trip)
	const [flow, dispatch] = useReducer(tripReceiptFlowReducer, undefined, createTripReceiptFlow)
	const card = getTripReceiptCard({ state, justSaved, canManage, itemCount, listName })
	const saved = state.kind === 'none' && justSaved
	const cardState = state.kind === 'none' ? saved ? 'saved' : 'no-receipt' : state.kind
	const headingId = `${testId}-title`
	useEffect(() => {
		if (openAddOnLoad && canManage) document.getElementById(headingId)?.focus()
	}, [openAddOnLoad, canManage, headingId])
	const actions = card.actions.map(action => {
		switch (action) {
			case 'upload': return <Button key={action} type='button' size='primary' onClick={() => dispatch({ type: 'upload-new' })}>Upload New Receipt</Button>
			case 'review': return state.kind === 'read' ? <Button key={action} type='button' size='primary' onClick={() => dispatch({ type: 'review', ticketId: state.ticketId })}>Review Receipt</Button> : null
			case 'open-receipt': return state.kind === 'failed' ? <Button key={action} asChild variant='outline' size='primary'><Link href={`/tickets/${state.ticketId}`}>Open Receipt</Link></Button> : null
			case 'view-trip': return trip ? <Button key={action} asChild variant='outline' size='primary'><Link href={`/shopping/${trip.id}`}>View Trip</Link></Button> : null
		}
	})
	return (
		<section data-testid={testId} data-state={cardState}>
			{saved ? <Card size='saved' data-testid='trip-saved-card'>
				<div className='flex flex-col items-center gap-4 text-center'>
					<RowIcon icon={ShoppingBag01Icon} tone='success' size='saved' testId='trip-saved-icon' />
					<h1 className='font-display text-xl font-semibold tracking-tight'>{card.title}</h1>
					<p className='text-sm leading-normal text-slate-500 dark:text-muted-foreground'>{card.message}</p>
					<Alert variant='warning'><AlertTitle>No receipt yet</AlertTitle><AlertDescription>Having no receipt never leaves the trip incomplete.</AlertDescription></Alert>
					<div className='flex w-full flex-col gap-2'>{actions}</div>
					<p className='text-xs leading-normal text-slate-500 dark:text-muted-foreground'>You can add a receipt later from Trips, with no deadline.</p>
				</div>
			</Card> : <StatusCard testId={`${testId}-state`} headingId={headingId}
				tone={state.kind === 'reading' ? 'info' : state.kind === 'read' ? 'success' : state.kind === 'failed' ? 'danger' : 'default'}
				icon={state.kind === 'reading' ? Loading03Icon : state.kind === 'read' ? CheckmarkCircle02Icon : state.kind === 'failed' ? Alert02Icon : Attachment01Icon}
				spinning={state.kind === 'reading'} title={card.title} description={card.message} actions={actions.length ? actions : undefined} />}
			{state.kind === 'reading' ? <TripReceiptReadingListener ticketId={state.ticketId} /> : null}
			{trip ? <>
				<UploadTicketDialog trigger={null} open={flow.upload} onOpenChange={open => dispatch({ type: 'set-upload', open })} shoppingSessionId={trip.id} />
				{flow.reviewTicketId ? <TripReceiptReview key={flow.reviewTicketId} ticketId={flow.reviewTicketId} trip={trip} onClose={() => dispatch({ type: 'close-review' })} /> : null}
			</> : null}
		</section>
	)
}
