import { describe, expect, it, vi } from 'vitest'

import { assignStore, createAndAssignStore, getTicketStoreState } from '../receipt/helpers/ticket-store-actions'

const STORE = { id: 'store-1', name: 'No Frills' }

describe('getTicketStoreState', () => {
	it('shows the confirmed store first', () => {
		expect(getTicketStoreState({ store: STORE, store_suggestion: { id: 'x', name: 'Other' }, store_name: 'NF' })).toEqual({
			kind: 'confirmed',
			store: STORE,
		})
	})

	it('proposes the store the raw name resolves to', () => {
		expect(getTicketStoreState({ store: null, store_suggestion: STORE, store_name: ' NOFRILLS ' })).toEqual({
			kind: 'suggested',
			store: STORE,
			rawName: 'NOFRILLS',
		})
	})

	it('offers to save a raw name that matches no store', () => {
		expect(getTicketStoreState({ store: null, store_suggestion: null, store_name: 'Fresh Co #12' })).toEqual({
			kind: 'unmatched',
			rawName: 'Fresh Co #12',
		})
	})

	it.each([null, '', '   '])('says the store was not recognized without a raw name (%p)', storeName => {
		expect(getTicketStoreState({ store: null, store_suggestion: null, store_name: storeName })).toEqual({ kind: 'unrecognized' })
	})
})

function actions(overrides: { create?: unknown; assign?: unknown } = {}) {
	return {
		create: vi.fn().mockResolvedValue(overrides.create ?? { data: { id: 'new-store' } }),
		assign: vi.fn().mockResolvedValue(overrides.assign ?? { data: {} }),
	}
}

describe('assignStore', () => {
	it('puts the store on the receipt, or removes it with null', async () => {
		const a = actions()

		await expect(assignStore('t1', 'store-1', a as never)).resolves.toEqual({ kind: 'done' })
		await expect(assignStore('t1', null, a as never)).resolves.toEqual({ kind: 'done' })
		expect(a.assign).toHaveBeenNthCalledWith(1, 't1', 'store-1')
		expect(a.assign).toHaveBeenNthCalledWith(2, 't1', null)
	})

	it('reports a failure without creating anything', async () => {
		const a = actions({ assign: { error: 'Store not found', errorCode: 'NOT_FOUND' } })

		await expect(assignStore('t1', 'store-1', a as never)).resolves.toMatchObject({ kind: 'error' })
		expect(a.create).not.toHaveBeenCalled()
	})
})

describe('createAndAssignStore', () => {
	it('creates the store, then puts it on the receipt', async () => {
		const a = actions()

		await expect(createAndAssignStore('t1', 'Fresh Co', a as never)).resolves.toEqual({ kind: 'done' })
		expect(a.create).toHaveBeenCalledWith({ name: 'Fresh Co' })
		expect(a.assign).toHaveBeenCalledWith('t1', 'new-store')
	})

	it('uses the store that already has the name instead of failing', async () => {
		const a = actions({ create: { error: 'Another store already uses this name.', errorCode: 'CONFLICT', details: { store_id: 'store-1' } } })

		await expect(createAndAssignStore('t1', 'NOFRILLS', a as never)).resolves.toEqual({ kind: 'done', reused: true })
		expect(a.assign).toHaveBeenCalledWith('t1', 'store-1')
	})

	it('keeps the new store id when only the assignment failed, so a retry only assigns', async () => {
		const a = actions({ assign: { error: 'Request failed' } })

		await expect(createAndAssignStore('t1', 'Fresh Co', a as never)).resolves.toMatchObject({
			kind: 'assign-failed',
			storeId: 'new-store',
		})
		expect(a.create).toHaveBeenCalledTimes(1)
	})

	it('shows the limit message and does not assign anything at the store limit', async () => {
		const message = 'You can have up to 50 stores. Merge stores to make room.'
		const a = actions({ create: { error: message, errorCode: 'LIMIT_EXCEEDED' } })

		await expect(createAndAssignStore('t1', 'One more', a as never)).resolves.toEqual({ kind: 'error', message })
		expect(a.assign).not.toHaveBeenCalled()
	})

	it('reports a lost connection', async () => {
		const a = actions()
		a.create.mockRejectedValue(new Error('offline'))

		await expect(createAndAssignStore('t1', 'Fresh Co', a as never)).resolves.toMatchObject({ kind: 'error' })
		expect(a.assign).not.toHaveBeenCalled()
	})
})
