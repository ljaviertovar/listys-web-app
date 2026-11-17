import { describe, expect, it } from 'vitest'

import { buildTicketListItem } from '../list/helpers/build-ticket-list-item'

const NOW = new Date(2026, 10, 16, 12, 0)
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
	it('names the receipt after its confirmed store and keeps the store for the filter', () => {
		const item = buildTicketListItem(receipt({ store: { name: 'Metro' }, store_name: 'METRO #1024' }), NOW)

		expect(item.title).toBe('Metro Receipt')
		expect(item.storeName).toBe('Metro')
		expect(item.storeConfirmed).toBe(true)
	})

	it('names a receipt without a confirmed store after the name read from it, and leaves it out of the store filter', () => {
		const item = buildTicketListItem(receipt({ store: null, store_name: 'WALMART #1042' }), NOW)

		expect(item.title).toBe('Walmart Receipt')
		expect(item.storeName).toBeNull()
		expect(item.storeConfirmed).toBe(false)
	})

	it('calls a receipt with no store name "Unnamed Receipt", whatever its date', () => {
		expect(buildTicketListItem(receipt({ store: null, store_name: null }), NOW).title).toBe('Unnamed Receipt')
		expect(buildTicketListItem(receipt({ store: null, store_name: null, created_at: null }), NOW).title).toBe('Unnamed Receipt')
	})

	it('keeps the upload date out of the title and tells receipts of one store apart by day and time', () => {
		const recent = buildTicketListItem(receipt({ store: { name: 'Metro' }, created_at: uploadedAt(10, 12) }), NOW)
		const older = buildTicketListItem(receipt({ id: 't2', store: { name: 'Metro' }, created_at: uploadedAt(10, 3, 18, 5) }), NOW)

		expect(recent.title).toBe(older.title)
		expect(recent.title).not.toMatch(/\d/)
		expect(recent.uploadedLabel).toBe('Uploaded 12 Nov · 10:42')
		expect(older.uploadedLabel).toBe('Uploaded 3 Nov · 18:05')
	})

	it('adds the year to an upload from another year, and says when the date is unknown', () => {
		expect(buildTicketListItem(receipt({ created_at: uploadedAt(10, 12, 10, 42, 2025) }), NOW).uploadedLabel).toBe('Uploaded 12 Nov 2025 · 10:42')
		expect(buildTicketListItem(receipt({ created_at: null }), NOW).uploadedLabel).toBe('Upload time unknown')
	})
})
