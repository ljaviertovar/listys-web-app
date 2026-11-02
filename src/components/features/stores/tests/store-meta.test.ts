import { describe, expect, it } from 'vitest'

import { buildStoreMeta } from '../helpers/store-meta'

describe('buildStoreMeta', () => {
	it('says nothing for a store with no visit and no usual items', () => {
		expect(buildStoreMeta({ last_visit: null, usual_items_count: 0 })).toBeNull()
		expect(buildStoreMeta({ last_visit: null })).toBeNull()
	})

	it('joins the last visit and the usual items', () => {
		const text = buildStoreMeta({
			last_visit: { kind: 'trip', id: 't1', at: '2026-10-28T22:07:00.000Z', total_amount: null },
			usual_items_count: 14,
		})

		expect(text?.startsWith('Last ')).toBe(true)
		expect(text?.endsWith(' · 14 items usually here')).toBe(true)
		expect(buildStoreMeta({ last_visit: null, usual_items_count: 1 })).toBe('1 item usually here')
	})
})
