import { describe, expect, it } from 'vitest'

import { getUploadSuccessOutcome } from '../helpers/upload-success'

describe('getUploadSuccessOutcome', () => {
	it('keeps the user on the trip when the receipt was uploaded from it', () => {
		const outcome = getUploadSuccessOutcome({ ticketId: 'ticket-1', fromTrip: true })
		expect(outcome.openReceiptId).toBeNull()
		expect(outcome.toastDescription).toContain('reading')
	})

	it('keeps the user on the trip even when the upload did not report the receipt id', () => {
		expect(getUploadSuccessOutcome({ ticketId: null, fromTrip: true }).openReceiptId).toBeNull()
	})

	it('opens the receipt when it was uploaded from anywhere else', () => {
		expect(getUploadSuccessOutcome({ ticketId: 'ticket-1', fromTrip: false })).toEqual({
			toastDescription: 'Opening your receipt…',
			openReceiptId: 'ticket-1',
		})
	})

	it('points to the receipts list when the id is unknown', () => {
		expect(getUploadSuccessOutcome({ ticketId: null, fromTrip: false })).toEqual({
			toastDescription: 'You can review its progress in your receipts.',
			openReceiptId: null,
		})
	})
})
