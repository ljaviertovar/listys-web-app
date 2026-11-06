import { describe, expect, it } from 'vitest'

import { RECEIPT_LINE_ITEM_INSTRUCTIONS } from '../receipt-items.ts'

describe('receipt line-item instructions', () => {
	it('preserves repeated products as separate printed rows', () => {
		expect(RECEIPT_LINE_ITEM_INSTRUCTIONS).toContain('one item object for every printed product row')
		expect(RECEIPT_LINE_ITEM_INSTRUCTIONS).toContain('return each row as a separate item object')
		expect(RECEIPT_LINE_ITEM_INSTRUCTIONS).toContain('Never collapse repeats')
		expect(RECEIPT_LINE_ITEM_INSTRUCTIONS).toContain('compare it with the number of product rows returned')
	})
})
