import { describe, expect, it } from 'vitest'

import { readTicketForReview } from '../helpers/read-ticket-for-review'
import { getTripReviewPhase } from '../helpers/trip-review-phase'

describe('getTripReviewPhase', () => {
	const phase = (overrides: Partial<Parameters<typeof getTripReviewPhase>[0]>) =>
		getTripReviewPhase({ open: true, loading: false, failed: false, hasReview: true, ...overrides })

	it('is closed until the review is opened, whatever else is true', () => {
		expect(phase({ open: false, loading: true })).toBe('closed')
	})

	it('is loading while the receipt and trip load, and before the comparison exists', () => {
		expect(phase({ loading: true })).toBe('loading')
		expect(phase({ hasReview: false })).toBe('loading')
	})

	it('reports a failure over loading', () => {
		expect(phase({ failed: true, loading: true })).toBe('error')
	})

	it('is ready only with the comparison in hand', () => {
		expect(phase({})).toBe('ready')
	})
})

describe('readTicketForReview', () => {
	it('reads the lines, the confirmed store and the printed total', () => {
		expect(
			readTicketForReview({
				id: 't',
				total_amount: 12.5,
				store: { id: 's1', name: 'Metro', extra: 1 },
				items: [{ id: 'a', name: 'Milk', price: 3, quantity: 2, unit: 'each', normalized_name: 'milk' }, { id: 'b', name: 'Eggs' }],
			}),
		).toEqual({ lines: [{ id: 'a', name: 'Milk', price: 3, quantity: 2, unit: 'each', normalized_name: 'milk' }, { id: 'b', name: 'Eggs', price: null, quantity: null, unit: null, normalized_name: null }], receiptStore: { id: 's1', name: 'Metro' }, totalAmount: 12.5 })
	})

	it('treats a missing store or total as none, and skips malformed lines', () => {
		expect(readTicketForReview({ items: [{ id: 'a', name: 'Milk' }, { id: 1 }, null], store: null })).toEqual({
			lines: [{ id: 'a', name: 'Milk', price: null, quantity: null, unit: null, normalized_name: null }],
			receiptStore: null,
			totalAmount: null,
		})
	})

	it('is null for a response that is not a receipt', () => {
		expect(readTicketForReview({ items: [], total_amount: 40, store: { id: 'store', name: 'Metro' } })).toBeNull()
		expect(readTicketForReview(null)).toBeNull()
		expect(readTicketForReview({ items: 'nope' })).toBeNull()
		expect(readTicketForReview({})).toBeNull()
	})
})
