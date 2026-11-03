import { describe, expect, it } from 'vitest'

import { getTripReceiptState } from '../helpers/get-trip-receipt-state'

describe('getTripReceiptState', () => {
	it('has no receipt when none is attached or waiting', () => {
		expect(getTripReceiptState({ attachedReceipt: null, pendingReceipt: null })).toEqual({ kind: 'none' })
		expect(getTripReceiptState({ attachedReceipt: undefined, pendingReceipt: undefined })).toEqual({ kind: 'none' })
	})

	it('is attached whenever a receipt is attached, whatever else was uploaded from the trip', () => {
		expect(getTripReceiptState({ attachedReceipt: { id: 'a' }, pendingReceipt: { id: 'p', ocr_status: 'processing' } })).toEqual({ kind: 'attached' })
	})

	it.each(['pending', 'processing', null, 'something-new'])('waits while the uploaded receipt is %s', status => {
		expect(getTripReceiptState({ attachedReceipt: null, pendingReceipt: { id: 'p', ocr_status: status } })).toEqual({ kind: 'reading', ticketId: 'p' })
	})

	it('offers the review once the uploaded receipt is read', () => {
		expect(getTripReceiptState({ attachedReceipt: null, pendingReceipt: { id: 'p', ocr_status: 'completed' } })).toEqual({ kind: 'read', ticketId: 'p' })
	})

	it('reports a receipt that could not be read', () => {
		expect(getTripReceiptState({ attachedReceipt: null, pendingReceipt: { id: 'p', ocr_status: 'failed' } })).toEqual({ kind: 'failed', ticketId: 'p' })
	})
})
