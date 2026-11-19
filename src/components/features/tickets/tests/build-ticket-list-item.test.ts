import { describe, expect, it } from 'vitest'

import { buildTicketListItem } from '../list/helpers/build-ticket-list-item'

// Built from local parts, so the expected day and time do not depend on the machine's time zone.
const uploadedAt = (month: number, day: number, hour = 10, minute = 42, year = 2026) => new Date(year, month, day, hour, minute).toISOString()

const receipt = (overrides: Partial<Parameters<typeof buildTicketListItem>[0]> = {}) => ({
	id: 't1',
	created_at: uploadedAt(10, 12),
	ocr_status: 'completed',
	total_items: 4,
	total_amount: 12.5,
	...overrides,
})

describe('buildTicketListItem', () => {
	it('shows the spending badge only for opted-in standalone receipts with an amount', () => {
		expect(buildTicketListItem(receipt()).includedInSpending).toBe(false)
		expect(buildTicketListItem(receipt({ include_in_spending: true })).includedInSpending).toBe(true)
		expect(buildTicketListItem(receipt({ include_in_spending: true, total_amount: null })).includedInSpending).toBe(false)
		expect(buildTicketListItem(receipt({ include_in_spending: true, shopping_session_id: 'trip-1' })).includedInSpending).toBe(false)
		expect(buildTicketListItem(receipt({ include_in_spending: true, uploaded_from_session_id: 'trip-1' })).includedInSpending).toBe(false)
	})
	it('names the receipt after its confirmed store and keeps the store for the filter', () => {
		const item = buildTicketListItem(receipt({ store: { name: 'Metro' }, store_name: 'METRO #1024' }))

		expect(item.title).toBe('Metro Receipt')
		expect(item.storeName).toBe('Metro')
		expect(item.storeConfirmed).toBe(true)
	})

	it('names a receipt without a confirmed store after the name read from it, and leaves it out of the store filter', () => {
		const item = buildTicketListItem(receipt({ store: null, store_name: 'WALMART #1042' }))

		expect(item.title).toBe('Walmart Receipt')
		expect(item.storeName).toBeNull()
		expect(item.storeConfirmed).toBe(false)
	})

	it('calls a receipt with no store name "Unnamed Receipt", whatever its date', () => {
		expect(buildTicketListItem(receipt({ store: null, store_name: null })).title).toBe('Unnamed Receipt')
		expect(buildTicketListItem(receipt({ store: null, store_name: null, created_at: null })).title).toBe('Unnamed Receipt')
	})

	it('keeps the upload date out of the title and tells receipts of one store apart by day and time', () => {
		const recent = buildTicketListItem(receipt({ store: { name: 'Metro' }, created_at: uploadedAt(10, 12) }))
		const older = buildTicketListItem(receipt({ id: 't2', store: { name: 'Metro' }, created_at: uploadedAt(10, 3, 18, 5) }))

		expect(recent.title).toBe(older.title)
		expect(recent.title).not.toMatch(/\d/)
		expect(recent.uploadedAt).toBe(uploadedAt(10, 12))
		expect(older.uploadedAt).toBe(uploadedAt(10, 3, 18, 5))
	})

	it('passes the printed purchase date separately and leaves the fallback to the date display', () => {
		expect(buildTicketListItem(receipt({ purchase_date: '2026-10-28' }))).toMatchObject({
			uploadedAt: uploadedAt(10, 12),
			purchaseDate: '2026-10-28',
		})
		expect(buildTicketListItem(receipt()).purchaseDate).toBeNull()
	})
})
