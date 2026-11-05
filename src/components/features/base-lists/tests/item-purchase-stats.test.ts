import { describe, expect, it } from 'vitest'
import { getItemPurchaseStats } from '../items/helpers/item-purchase-stats'

describe('purchase interval', () => {
	it('uses the same average interval as Likely Needed and does not infer one from a single purchase', () => {
		const dates = { first_seen_at: '2026-02-01T12:00:00Z', last_purchased_at: '2026-02-19T12:00:00Z' }
		expect(getItemPurchaseStats({ ...dates, purchase_count: 3 }).intervalDays).toBe(9)
		expect(getItemPurchaseStats({ ...dates, purchase_count: 1 }).intervalDays).toBeNull()
		expect(getItemPurchaseStats({ ...dates, purchase_count: 0 }).lastBought).toBeNull()
	})
})
