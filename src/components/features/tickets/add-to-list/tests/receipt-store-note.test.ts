import { describe, expect, it } from 'vitest'

import { shouldShowReceiptStoreUnconfirmedNote } from '../helpers/receipt-store-note'

describe('receipt store note', () => {
	it('shows only while choosing a list when the receipt has no confirmed store', () => {
		expect(shouldShowReceiptStoreUnconfirmedNote(false, false)).toBe(true)
		expect(shouldShowReceiptStoreUnconfirmedNote(true, false)).toBe(false)
		expect(shouldShowReceiptStoreUnconfirmedNote(false, true)).toBe(false)
	})
})
