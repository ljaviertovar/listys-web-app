import { describe, expect, it } from 'vitest'

import { createTripReceiptFlow, shouldOpenAddOnLoad, tripReceiptFlowReducer } from '../helpers/trip-receipt-flow'

const closed = createTripReceiptFlow(false)

describe('shouldOpenAddOnLoad', () => {
	const base = { requested: true, canManage: true, state: { kind: 'none' } as const }

	it('opens the Add Receipt choice when the trip card asked for it', () => {
		expect(shouldOpenAddOnLoad(base)).toBe(true)
		expect(shouldOpenAddOnLoad({ ...base, state: { kind: 'failed', ticketId: 't' } })).toBe(true)
	})

	it('stays closed without the request, for a viewer who cannot add, or while a receipt is waiting', () => {
		expect(shouldOpenAddOnLoad({ ...base, requested: false })).toBe(false)
		expect(shouldOpenAddOnLoad({ ...base, canManage: false })).toBe(false)
		expect(shouldOpenAddOnLoad({ ...base, state: { kind: 'reading', ticketId: 't' } })).toBe(false)
		expect(shouldOpenAddOnLoad({ ...base, state: { kind: 'read', ticketId: 't' } })).toBe(false)
	})
})

describe('tripReceiptFlowReducer', () => {
	it('starts with the Add Receipt choice open only when asked', () => {
		expect(createTripReceiptFlow(true).add).toBe(true)
		expect(closed).toEqual({ add: false, upload: false, choose: false, reviewTicketId: null })
	})

	it('moves from the Add Receipt choice to the upload', () => {
		const flow = tripReceiptFlowReducer(createTripReceiptFlow(true), { type: 'upload-new' })
		expect(flow).toMatchObject({ add: false, upload: true, choose: false })
	})

	it('moves from the Add Receipt choice to the list of uploaded receipts', () => {
		const flow = tripReceiptFlowReducer(createTripReceiptFlow(true), { type: 'choose-uploaded' })
		expect(flow).toMatchObject({ add: false, choose: true, upload: false })
	})

	it('offers a new upload from the empty list of uploaded receipts', () => {
		const chooser = tripReceiptFlowReducer(closed, { type: 'choose-uploaded' })
		expect(tripReceiptFlowReducer(chooser, { type: 'upload-new' })).toMatchObject({ choose: false, upload: true })
	})

	it('opens the review for the chosen receipt and closes the list, attaching nothing', () => {
		const chooser = tripReceiptFlowReducer(closed, { type: 'choose-uploaded' })
		const flow = tripReceiptFlowReducer(chooser, { type: 'review', ticketId: 'ticket-9' })
		expect(flow).toEqual({ add: false, upload: false, choose: false, reviewTicketId: 'ticket-9' })
	})

	it('opens the review of a receipt that is ready straight from the card', () => {
		expect(tripReceiptFlowReducer(closed, { type: 'review', ticketId: 't' }).reviewTicketId).toBe('t')
	})

	it('closes the review without choosing anything else, so the receipt stays available', () => {
		const reviewing = tripReceiptFlowReducer(closed, { type: 'review', ticketId: 't' })
		expect(tripReceiptFlowReducer(reviewing, { type: 'close-review' })).toEqual(closed)
	})

	it('lets each sheet be closed on its own', () => {
		expect(tripReceiptFlowReducer(createTripReceiptFlow(true), { type: 'set-add', open: false }).add).toBe(false)
		expect(tripReceiptFlowReducer({ ...closed, upload: true }, { type: 'set-upload', open: false }).upload).toBe(false)
		expect(tripReceiptFlowReducer({ ...closed, choose: true }, { type: 'set-choose', open: false }).choose).toBe(false)
	})
})
