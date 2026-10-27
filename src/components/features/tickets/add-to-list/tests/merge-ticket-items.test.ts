import { describe, expect, it, vi } from 'vitest'

import { loadMergeListTargets, modeForListCount, submitTicketItemsToList } from '../helpers/merge-ticket-items'

const input = {
	mode: 'existing' as const,
	ticketId: 'fixture-ticket',
	selectedItemIds: ['fixture-item-1', 'fixture-item-2'],
	selectedBaseListId: 'fixture-list',
	newListName: '',
}

describe('modeForListCount', () => {
	it('goes straight to creating a list when the user has none', () => {
		expect(modeForListCount(0, 'existing')).toBe('new')
	})

	it('keeps whatever the user picked when there are lists', () => {
		expect(modeForListCount(3, 'existing')).toBe('existing')
		expect(modeForListCount(3, 'new')).toBe('new')
	})
})

describe('loadMergeListTargets', () => {
	it('returns known empty fixture data without treating it as a request failure', async () => {
		const targets = await loadMergeListTargets({
			getBaseLists: vi.fn().mockResolvedValue({ data: [], error: undefined }),
		})

		expect(targets).toEqual({ baseLists: [] })
	})

	it('returns every list of the user, with no group to pick first', async () => {
		const lists = [
			{ id: 'l1', name: 'Pantry', created_at: '2026-01-01T00:00:00Z', group_id: 'g1' },
			{ id: 'l2', name: 'Costco', created_at: '2026-02-01T00:00:00Z', group_id: 'g2' },
		]

		const targets = await loadMergeListTargets({ getBaseLists: vi.fn().mockResolvedValue({ data: lists }) })

		expect(targets.baseLists.map(list => list.id)).toEqual(['l1', 'l2'])
		expect(targets).not.toHaveProperty('groups')
	})

	it('rejects a failed list request so the UI can show its retry state', async () => {
		await expect(loadMergeListTargets({
			getBaseLists: vi.fn().mockResolvedValue({ error: 'fixture failure' }),
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

	it('creates a new list from the name alone, trimmed, and reports the selected item count', async () => {
		const create = vi.fn().mockResolvedValue({ data: { id: 'fixture-created-list' } })
		const merge = vi.fn()

		const result = await submitTicketItemsToList({ ...input, mode: 'new', newListName: '  Pantry  ' }, { merge, create })

		expect(create).toHaveBeenCalledWith({
			ticket_id: 'fixture-ticket',
			name: 'Pantry',
			item_ids: ['fixture-item-1', 'fixture-item-2'],
		})
		expect(create.mock.calls[0][0]).not.toHaveProperty('group_id')
		expect(merge).not.toHaveBeenCalled()
		expect(result).toEqual({ kind: 'created', baseListId: 'fixture-created-list', itemCount: 2 })
	})

	it('asks for a name before creating a list', async () => {
		const create = vi.fn()

		const result = await submitTicketItemsToList({ ...input, mode: 'new', newListName: '   ' }, { merge: vi.fn(), create })

		expect(result).toEqual({ kind: 'invalid', message: 'Enter a name for this list.' })
		expect(create).not.toHaveBeenCalled()
	})

	it('returns the new-list error without claiming success when the API rejects it', async () => {
		const result = await submitTicketItemsToList({ ...input, mode: 'new', newListName: 'Pantry' }, {
			merge: vi.fn(),
			create: vi.fn().mockResolvedValue({ error: 'fixture failure' }),
		})

		expect(result).toEqual({ kind: 'error', message: 'We couldn’t create your list. Try again.' })
	})

	it('tells the user when the name is already taken, without mentioning groups', async () => {
		const result = await submitTicketItemsToList({ ...input, mode: 'new', newListName: 'Pantry' }, {
			merge: vi.fn(),
			create: vi.fn().mockResolvedValue({ error: 'A list with this name already exists.', errorCode: 'CONFLICT' }),
		})

		expect(result).toEqual({ kind: 'error', message: 'You already have a list with this name. Choose another name.' })
	})

	it('turns a rejected request into connection feedback', async () => {
		const result = await submitTicketItemsToList(input, {
			merge: vi.fn().mockRejectedValue(new Error('fixture transport failure')),
			create: vi.fn(),
		})

		expect(result).toEqual({ kind: 'error', message: 'We couldn’t add these items. Check your connection and try again.' })
	})

	it('sends the review decisions as links, and leaves them out when there are none', async () => {
		const merge = vi.fn().mockResolvedValue({ success: true, new_count: 0, updated_count: 2, skipped_count: 0 })
		const links = [{ ticket_item_id: 'fixture-item-1', base_list_item_id: 'fixture-base-item' }]

		await submitTicketItemsToList({ ...input, links }, { merge, create: vi.fn() })
		await submitTicketItemsToList({ ...input, links: [] }, { merge, create: vi.fn() })

		expect(merge.mock.calls[0][0]).toMatchObject({ links })
		expect(merge.mock.calls[1][0]).not.toHaveProperty('links')
	})

	it('says how to fix a list that cannot take the new items', async () => {
		const result = await submitTicketItemsToList(input, {
			merge: vi.fn().mockResolvedValue({ error: 'Cannot merge items.', errorCode: 'LIMIT_EXCEEDED' }),
			create: vi.fn(),
		})

		expect(result).toEqual({
			kind: 'error',
			message: 'This list can’t take that many new items. Link some lines to existing items, or add fewer.',
		})
	})
})
