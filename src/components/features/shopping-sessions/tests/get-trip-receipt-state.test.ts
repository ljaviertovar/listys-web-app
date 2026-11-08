import { describe, expect, it } from 'vitest'

import { getTripReceiptState } from '../helpers/get-trip-receipt-state'

describe('getTripReceiptState', () => {
	it('has no receipt when none is attached or waiting', () => {
		expect(getTripReceiptState({ receipts: [], pendingReceipt: null })).toEqual({ kind: 'none' })
		expect(getTripReceiptState({ receipts: undefined, pendingReceipt: undefined })).toEqual({ kind: 'none' })
	})

	it('keeps following a pending receipt when another receipt is attached', () => {
		expect(getTripReceiptState({ receipts: [{ id: 'a' }, { id: 'b' }], pendingReceipt: { id: 'p', ocr_status: 'processing' } })).toEqual({ kind: 'reading', ticketId: 'p' })
	})

	it('is attached with two receipts and no pending upload', () => {
		expect(getTripReceiptState({ receipts: [{ id: 'a' }, { id: 'b' }], pendingReceipt: null })).toEqual({ kind: 'attached' })
	})

	it.each(['pending', 'processing', null, 'something-new'])('waits while the uploaded receipt is %s', status => {
		expect(getTripReceiptState({ receipts: [], pendingReceipt: { id: 'p', ocr_status: status } })).toEqual({ kind: 'reading', ticketId: 'p' })
	})

	it('offers the review once the uploaded receipt is read', () => {
		expect(getTripReceiptState({ receipts: [], pendingReceipt: { id: 'p', ocr_status: 'completed' } })).toEqual({ kind: 'read', ticketId: 'p' })
	})

	it('reports a receipt that could not be read', () => {
		expect(getTripReceiptState({ receipts: [], pendingReceipt: { id: 'empty', ocr_status: 'completed', total_items: 0 } })).toEqual({ kind: 'failed', ticketId: 'empty' })
		expect(getTripReceiptState({ receipts: [], pendingReceipt: { id: 'p', ocr_status: 'failed' } })).toEqual({ kind: 'failed', ticketId: 'p' })
	})
})
