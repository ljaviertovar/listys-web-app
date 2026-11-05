import { describe, expect, it } from 'vitest'
import { getTripReceiptCard } from '../helpers/get-trip-receipt-card'

const base = { justSaved: false, canManage: true, itemCount: 3, listName: 'Pantry' }
describe('trip receipt actions', () => {
	it.each([
		[{ kind: 'none' }, ['upload']],
		[{ kind: 'reading', ticketId: 'r' }, []],
		[{ kind: 'read', ticketId: 'r' }, ['review']],
		[{ kind: 'failed', ticketId: 'r' }, ['open-receipt', 'upload']],
	] as const)('offers the direct action for %j', (state, actions) => {
		expect(getTripReceiptCard({ ...base, state }).actions).toEqual(actions)
		expect(getTripReceiptCard({ ...base, state, canManage: false }).actions).toEqual([])
	})
	it('offers a new upload and the trip after saving, independent of old uploaded receipts', () => {
		expect(getTripReceiptCard({ ...base, state: { kind: 'none' }, justSaved: true }).actions).toEqual(['upload', 'view-trip'])
	})
})
