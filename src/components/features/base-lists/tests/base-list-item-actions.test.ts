import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	createBaseListItem: vi.fn(),
	deleteBaseListItem: vi.fn(),
	updateBaseListItem: vi.fn(),
	refresh: vi.fn(),
	broadcastListActivity: vi.fn(),
	toast: vi.fn(),
	toastError: vi.fn(),
	toastSuccess: vi.fn(),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }))
vi.mock('sonner', () => ({
	toast: Object.assign(mocks.toast, { error: mocks.toastError, success: mocks.toastSuccess }),
}))
vi.mock('@/lib/api/endpoints', () => ({
	createBaseListItem: mocks.createBaseListItem,
	deleteBaseListItem: mocks.deleteBaseListItem,
	updateBaseListItem: mocks.updateBaseListItem,
}))
vi.mock('@/utils', () => ({ broadcastListActivity: mocks.broadcastListActivity }))

import { useBaseListItemActions } from '../items/hooks/use-base-list-item-actions'
import type { BaseListItem } from '@/types'

const item = {
	id: 'synthetic-item',
	base_list_id: 'synthetic-list',
	name: 'Sample product',
	quantity: 2,
	unit: 'box',
	notes: 'Keep chilled',
	category: 'Grocery',
	sort_order: 4,
} as BaseListItem

describe('base list item feedback', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('offers Undo only after a successful delete and restores the original item fields', async () => {
		mocks.deleteBaseListItem.mockResolvedValue({ error: null })
		mocks.createBaseListItem.mockResolvedValue({ error: null })
		const { remove } = useBaseListItemActions(item)

		await remove()

		expect(mocks.toast).toHaveBeenCalledWith('Item deleted', expect.objectContaining({
			duration: 6000,
			action: expect.objectContaining({ label: 'Undo', onClick: expect.any(Function) }),
		}))
		expect(mocks.refresh).toHaveBeenCalledOnce()

		const toastOptions = mocks.toast.mock.calls.at(-1)?.[1] as { action: { onClick: () => Promise<void> } }
		await toastOptions.action.onClick()

		expect(mocks.createBaseListItem).toHaveBeenCalledWith({
			base_list_id: 'synthetic-list',
			name: 'Sample product',
			quantity: 2,
			sort_order: 4,
			unit: 'box',
			notes: 'Keep chilled',
			category: 'Grocery',
		})
		expect(mocks.refresh).toHaveBeenCalledTimes(2)
	})

	it('does not offer Undo when delete fails and shows a safe error toast', async () => {
		mocks.deleteBaseListItem.mockResolvedValue({ error: 'Synthetic failure' })
		const { remove } = useBaseListItemActions(item)

		await remove()

		expect(mocks.toast).not.toHaveBeenCalled()
		expect(mocks.toastError).toHaveBeenCalledWith('Failed to delete item', { description: 'Synthetic failure' })
		expect(mocks.refresh).not.toHaveBeenCalled()
	})

	it('announces an Undo failure without claiming the item was restored', async () => {
		mocks.deleteBaseListItem.mockResolvedValue({ error: null })
		mocks.createBaseListItem.mockResolvedValue({ error: 'Synthetic restore failure' })
		const { remove } = useBaseListItemActions(item)
		await remove()

		const toastOptions = mocks.toast.mock.calls.at(-1)?.[1] as { action: { onClick: () => Promise<void> } }
		await toastOptions.action.onClick()

		expect(mocks.toastError).toHaveBeenCalledWith('Could not undo', { description: 'Synthetic restore failure' })
		expect(mocks.refresh).toHaveBeenCalledOnce()
	})
})
