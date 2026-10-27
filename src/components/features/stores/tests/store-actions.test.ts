import { describe, expect, it, vi } from 'vitest'

import { mergeStoresAction, renameStoreAction } from '../helpers/store-actions'

const actions = (rename: unknown = { data: {} }, merge: unknown = { data: {} }) => ({
	rename: vi.fn().mockResolvedValue(rename),
	merge: vi.fn().mockResolvedValue(merge),
})

describe('renameStoreAction', () => {
	it('renames the store', async () => {
		const a = actions()

		await expect(renameStoreAction('s1', 'Metro', a as never)).resolves.toEqual({ kind: 'done' })
		expect(a.rename).toHaveBeenCalledWith('s1', { name: 'Metro' })
	})

	it('turns a name another store has into the way out: merging into that store', async () => {
		const a = actions({ error: 'Another store already uses this name.', errorCode: 'CONFLICT', details: { store_id: 's2' } })

		await expect(renameStoreAction('s1', 'No Frills', a as never)).resolves.toEqual({ kind: 'conflict', storeId: 's2' })
	})

	it('gives a safe message for any other failure', async () => {
		const a = actions({ error: 'Store not found', errorCode: 'NOT_FOUND' })
		await expect(renameStoreAction('s1', 'Metro', a as never)).resolves.toEqual({
			kind: 'error',
			message: 'This store no longer exists. Refresh the page.',
		})

		const offline = actions()
		offline.rename.mockRejectedValue(new Error('offline'))
		await expect(renameStoreAction('s1', 'Metro', offline as never)).resolves.toMatchObject({ kind: 'error' })
	})
})

describe('mergeStoresAction', () => {
	it('merges the source store into the target', async () => {
		const a = actions()

		await expect(mergeStoresAction('target', 'source', a as never)).resolves.toEqual({ kind: 'done' })
		expect(a.merge).toHaveBeenCalledWith('target', { source_store_id: 'source' })
	})

	it('reports a failure without claiming the stores were merged', async () => {
		const a = actions(undefined, { error: 'Request failed' })

		await expect(mergeStoresAction('target', 'source', a as never)).resolves.toEqual({
			kind: 'error',
			message: 'We couldn’t merge these stores. Try again.',
		})
	})
})
