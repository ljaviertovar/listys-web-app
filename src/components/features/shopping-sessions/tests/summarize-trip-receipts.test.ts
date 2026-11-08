import { describe, expect, it } from 'vitest'
import { summarizeTripReceipts, type TripReceiptEntry } from '../helpers/summarize-trip-receipts'

const receipt = (attached: boolean): TripReceiptEntry => ({ id: attached ? 'attached' : 'pending', attached, total_amount: attached ? 41.12 : 86.4, items_count: 4, store: { id: 'store', name: 'Costco' }, ocr_status: 'completed' })

describe('trip receipts accounting', () => {
	it('recalculates attachment and deletion, keeping pending money out', () => {
		const first = { ...receipt(true), total_amount: 82.5 }
		const second = { ...receipt(false), id: 'second', total_amount: 41.12 }
		expect(summarizeTripReceipts([first, second]).paid).toBe(82.5)
		second.attached = true
		expect(summarizeTripReceipts([first, second]).paid).toBeCloseTo(123.62)
		expect(summarizeTripReceipts([second]).paid).toBe(41.12)
	})
	it('accepts zero but does not claim a complete total for unknown attached amounts', () => {
		expect(summarizeTripReceipts([{ ...receipt(true), total_amount: 0 }])).toMatchObject({ paid: 0, hasCompleteTotals: true })
		expect(summarizeTripReceipts([receipt(true), { ...receipt(true), total_amount: null }]).hasCompleteTotals).toBe(false)
		expect(summarizeTripReceipts([receipt(true), { ...receipt(false), total_amount: null }]).hasCompleteTotals).toBe(true)
	})
	it.each([
		[[receipt(false)], 0, 1],
		[[receipt(true)], 41.12, 0],
		[[receipt(false), receipt(true)], 41.12, 1],
		[[], 0, 0],
	] as const)('only counts attached money for %j', (receipts, paid, toReview) => {
		expect(summarizeTripReceipts(receipts)).toMatchObject({ count: receipts.length, paid, toReview })
	})
})
