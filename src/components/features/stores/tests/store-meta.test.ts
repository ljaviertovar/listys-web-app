import { describe, expect, it } from 'vitest'

import { buildStoreFacts } from '../helpers/store-meta'

describe('buildStoreFacts', () => {
	it('says nothing for a store with no visit or receipts', () => {
		expect(buildStoreFacts({ last_visit: null, receipt_count: 0 })).toEqual([])
	})

	it('gives the last visit as words and the receipts as a figure', () => {
		const now = new Date(2026, 10, 16)
		const facts = buildStoreFacts(
			{ last_visit: { kind: 'trip', id: 't1', at: '2026-10-28T15:00:00.000Z', total_amount: null }, receipt_count: 14 },
			now,
		)

		expect(facts).toEqual([{ value: 'Last visit 28 Oct' }, { kind: 'time', value: 14, unit: 'receipts' }])
		expect(buildStoreFacts({ last_visit: null, receipt_count: 1 })).toEqual([{ kind: 'time', value: 1, unit: 'receipt' }])
	})
})
