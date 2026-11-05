import { describe, expect, it } from 'vitest'
import { summarizeTripReceipts, type TripReceiptEntry } from '../helpers/summarize-trip-receipts'

const receipt = (attached: boolean): TripReceiptEntry => ({ id: attached ? 'attached' : 'pending', attached, total_amount: attached ? 41.12 : 86.4, items_count: 4, store: { id: 'store', name: 'Costco' }, ocr_status: 'completed' })

describe('trip receipts accounting', () => {
	it.each([
		[[receipt(false)], 0, 1],
		[[receipt(true)], 41.12, 0],
		[[receipt(false), receipt(true)], 41.12, 1],
		[[], 0, 0],
	] as const)('only counts attached money for %j', (receipts, paid, toReview) => {
		expect(summarizeTripReceipts(receipts)).toMatchObject({ count: receipts.length, paid, toReview })
	})
})
