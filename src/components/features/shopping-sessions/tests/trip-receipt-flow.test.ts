import { describe, expect, it } from 'vitest'
import { createTripReceiptFlow, tripReceiptFlowReducer } from '../helpers/trip-receipt-flow'

describe('trip receipt flow', () => {
	it('starts closed; an upload opens directly', () => {
		expect(createTripReceiptFlow()).toEqual({ upload: false, reviewTicketId: null })
		expect(tripReceiptFlowReducer(createTripReceiptFlow(), { type: 'upload-new' })).toEqual({ upload: true, reviewTicketId: null })
	})
	it('opens only the requested review and closes without choosing another action', () => {
		const reviewing = tripReceiptFlowReducer({ upload: true, reviewTicketId: null }, { type: 'review', ticketId: 'r' })
		expect(reviewing).toEqual({ upload: false, reviewTicketId: 'r' })
		expect(tripReceiptFlowReducer(reviewing, { type: 'close-review' })).toEqual(createTripReceiptFlow())
	})
	it('lets an upload close independently', () => {
		expect(tripReceiptFlowReducer({ upload: true, reviewTicketId: null }, { type: 'set-upload', open: false })).toEqual(createTripReceiptFlow())
	})
})
