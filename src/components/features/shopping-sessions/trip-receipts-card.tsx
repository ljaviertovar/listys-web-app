'use client'

import { useEffect, useReducer } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Attachment01Icon, CheckmarkCircle02Icon, Invoice01Icon, Loading03Icon, ShoppingBag03Icon, Upload06Icon } from '@hugeicons/core-free-icons'

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
			case 'upload': return (
				<Button key={action} type='button' size={state.kind === 'none' && !saved ? 'sm' : 'primary'} onClick={() => dispatch({ type: 'upload-new' })}>
					<HugeiconsIcon icon={state.kind === 'none' ? Attachment01Icon : Upload06Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
					{state.kind === 'none' ? 'Attach Receipt' : 'Upload Receipt'}
				</Button>
			)
			case 'review': return state.kind === 'read' ? <Button key={action} type='button' size='primary' onClick={() => dispatch({ type: 'review', ticketId: state.ticketId })}>Review Receipt</Button> : null
			case 'open-receipt': return state.kind === 'failed' ? <Button key={action} asChild variant='outline' size='primary'><Link href={`/tickets/${state.ticketId}`}>Open Receipt</Link></Button> : null
			case 'view-trip': return trip ? <Button key={action} asChild variant='secondary' size='primary'><Link href={`/shopping/${trip.id}?details=1&from=trip-saved`}>View Trip</Link></Button> : null
		}
	})
	return (
		<section data-testid={testId} data-state={cardState}>
			{saved ? <Card size='receipt' data-testid='trip-saved-card' aria-labelledby={headingId}>
					<div className='flex flex-col items-center text-center'>
						<RowIcon icon={ShoppingBag03Icon} tone='success' size='saved' testId='trip-saved-icon' />
						<h1 id={headingId} className='mt-[18px] font-display text-lg leading-[1.39] font-semibold tracking-tight'>{card.title}</h1>
						<p className='mt-1.5 max-w-70 text-sm leading-normal text-slate-500 dark:text-muted-foreground'>{card.message}</p>
						<Alert variant='receipt-warning' className='mt-[18px]'><RowIcon icon={Invoice01Icon} tone='warning' size='sm' testId='trip-saved-no-receipt-icon' /><AlertTitle>No receipt yet</AlertTitle><AlertDescription>Having no receipt never leaves the trip incomplete.</AlertDescription></Alert>
						<div className='mt-[18px] flex w-full flex-col gap-2'>{actions}</div>
						<p className='mt-3.5 max-w-70 text-xs leading-[1.4] text-slate-500 dark:text-muted-foreground'>You can add a receipt later from Trips, with no deadline.</p>
					</div>
				</Card> : state.kind === 'none' ? <Alert variant='receipt-warning' data-testid={`${testId}-state`}>
					<RowIcon icon={Invoice01Icon} tone='warning' size='sm' testId='trip-no-receipt-icon' />
					<AlertTitle id={headingId} tabIndex={-1}>No receipt</AlertTitle>
					<AlertDescription>{card.message}</AlertDescription>
					{actions.length ? <div className='col-start-2 mt-2 flex gap-2'>{actions}</div> : null}
				</Alert> : <StatusCard testId={`${testId}-state`} headingId={headingId}
				tone={state.kind === 'reading' ? 'info' : state.kind === 'read' ? 'success' : state.kind === 'failed' ? 'danger' : 'default'}
				icon={state.kind === 'reading' ? Loading03Icon : state.kind === 'read' ? CheckmarkCircle02Icon : state.kind === 'failed' ? Alert02Icon : undefined}
				spinning={state.kind === 'reading'} title={card.title} description={card.message} actions={actions.length ? actions : undefined} />}
			{state.kind === 'reading' ? <TripReceiptReadingListener ticketId={state.ticketId} /> : null}
			{trip ? <>
				<UploadTicketDialog trigger={null} open={flow.upload} onOpenChange={open => dispatch({ type: 'set-upload', open })} shoppingSessionId={trip.id} />
				{flow.reviewTicketId ? <TripReceiptReview key={flow.reviewTicketId} ticketId={flow.reviewTicketId} trip={trip} onClose={() => dispatch({ type: 'close-review' })} /> : null}
			</> : null}
		</section>
	)
}
