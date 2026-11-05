import { describe, expect, it } from 'vitest'

import { readTicketForReview } from '../helpers/read-ticket-for-review'
import { describeTripReview, getTripReviewPhase } from '../helpers/trip-review-phase'

const trip = { name: 'Saturday shop', store: { id: 's', name: 'Metro' }, started_at: null, completed_at: '2026-11-01T15:30:00Z' }

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

describe('describeTripReview', () => {
	it('invites the review only when it is ready', () => {
		expect(describeTripReview(trip, 'ready')).toContain('Review how this receipt will update the trip.')
	})

	it.each(['loading', 'closed', 'error'] as const)('does not invite a review while %s', phase => {
		expect(describeTripReview(trip, phase)).not.toContain('Review how this receipt will update the trip')
	})

	it('names the trip while loading and when it failed', () => {
		expect(describeTripReview(trip, 'loading')).toContain('Saturday shop')
		expect(describeTripReview(trip, 'error')).toContain('couldn’t load')
	})

	it('has nothing to name before the trip is known', () => {
		expect(describeTripReview(null, 'loading')).not.toContain('Review how this receipt')
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
		expect(readTicketForReview(null)).toBeNull()
		expect(readTicketForReview({ items: 'nope' })).toBeNull()
		expect(readTicketForReview({})).toBeNull()
	})
})
