import { describe, expect, it, vi } from 'vitest'

import { loadMergeListTargets, submitTicketItemsToList } from '../helpers/merge-ticket-items'

const input = {
	mode: 'existing' as const,
	ticketId: 'fixture-ticket',
	selectedItemIds: ['fixture-item-1', 'fixture-item-2'],
	selectedBaseListId: 'fixture-list',
	selectedGroupId: 'fixture-group',
	newListName: '',
}

describe('loadMergeListTargets', () => {
	it('returns known empty fixture data without treating it as a request failure', async () => {
		const targets = await loadMergeListTargets({
			getGroups: vi.fn().mockResolvedValue({ data: [], error: undefined }),
			getBaseLists: vi.fn().mockResolvedValue({ data: [], error: undefined }),
		})

		expect(targets).toEqual({ groups: [], baseLists: [] })
	})

	it('rejects a failed group or list request so the UI can show its retry state', async () => {
		await expect(loadMergeListTargets({
			getGroups: vi.fn().mockResolvedValue({ error: 'fixture failure' }),
			getBaseLists: vi.fn().mockResolvedValue({ data: [], error: undefined }),
		})).rejects.toThrow('Could not load lists')
	})
})

describe('submitTicketItemsToList', () => {
	it('merges selected items into the chosen list and returns the actual summary', async () => {
		const merge = vi.fn().mockResolvedValue({ success: true, new_count: 1, updated_count: 1, skipped_count: 0 })
		const create = vi.fn()

		const result = await submitTicketItemsToList(input, { merge, create })

		expect(merge).toHaveBeenCalledWith({
			ticket_id: 'fixture-ticket',
			base_list_id: 'fixture-list',
			items: [
				{ id: 'fixture-item-1', merge: true },
				{ id: 'fixture-item-2', merge: true },
			],
		})
		expect(create).not.toHaveBeenCalled()
		expect(result).toEqual({ kind: 'merged', baseListId: 'fixture-list', counts: { added: 1, updated: 1, skipped: 0 } })
	})

	it('returns a safe error for a failed merge and does not report success', async () => {
		const result = await submitTicketItemsToList(input, {
			merge: vi.fn().mockResolvedValue({ error: 'fixture failure' }),
			create: vi.fn(),
		})

		expect(result).toEqual({ kind: 'error', message: 'We couldn’t add these items to your list. Try again.' })
	})

	it('validates an existing destination before calling either action', async () => {
		const merge = vi.fn()
		const create = vi.fn()

		const result = await submitTicketItemsToList({ ...input, selectedBaseListId: '' }, { merge, create })

		expect(result).toEqual({ kind: 'invalid', message: 'Choose a shopping list.' })
		expect(merge).not.toHaveBeenCalled()
		expect(create).not.toHaveBeenCalled()
	})

	it('creates a new list with a trimmed name and reports the selected item count', async () => {
		const create = vi.fn().mockResolvedValue({ data: { id: 'fixture-created-list' } })
		const merge = vi.fn()

		const result = await submitTicketItemsToList({ ...input, mode: 'new', newListName: '  Pantry  ' }, { merge, create })

		expect(create).toHaveBeenCalledWith({
			ticket_id: 'fixture-ticket',
			group_id: 'fixture-group',
			name: 'Pantry',
			item_ids: ['fixture-item-1', 'fixture-item-2'],
		})
		expect(merge).not.toHaveBeenCalled()
		expect(result).toEqual({ kind: 'created', baseListId: 'fixture-created-list', itemCount: 2 })
	})

	it('returns the new-list error without claiming success when the API rejects it', async () => {
		const result = await submitTicketItemsToList({ ...input, mode: 'new', newListName: 'Pantry' }, {
			merge: vi.fn(),
			create: vi.fn().mockResolvedValue({ error: 'fixture failure' }),
		})

		expect(result).toEqual({ kind: 'error', message: 'We couldn’t create your list. Try again.' })
	})

	it('turns a rejected request into connection feedback', async () => {
		const result = await submitTicketItemsToList(input, {
			merge: vi.fn().mockRejectedValue(new Error('fixture transport failure')),
			create: vi.fn(),
		})

		expect(result).toEqual({ kind: 'error', message: 'We couldn’t add these items. Check your connection and try again.' })
	})
})
