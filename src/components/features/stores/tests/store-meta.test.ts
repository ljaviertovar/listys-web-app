import { describe, expect, it } from 'vitest'

import { buildStoreMeta } from '../helpers/store-meta'

describe('buildStoreMeta', () => {
	it('says nothing for a store with no visit or receipts', () => {
		expect(buildStoreMeta({ last_visit: null, receipt_count: 0 })).toBeNull()
	})

	it('joins the last visit and receipt count', () => {
		const text = buildStoreMeta({
			last_visit: { kind: 'trip', id: 't1', at: '2026-10-28T22:07:00.000Z', total_amount: null },
			receipt_count: 14,
		})

		expect(text?.startsWith('Last ')).toBe(true)
		expect(text?.endsWith(' · 14 receipts')).toBe(true)
		expect(buildStoreMeta({ last_visit: null, receipt_count: 1 })).toBe('1 receipt')
	})
})
