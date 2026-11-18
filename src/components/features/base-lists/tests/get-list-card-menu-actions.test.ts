import { describe, expect, it, vi } from 'vitest'

import { getListCardMenuActions } from '../helpers/get-list-card-menu-actions'

describe('getListCardMenuActions', () => {
	const callbacks = { onEdit: vi.fn(), onShare: vi.fn(), onDelete: vi.fn() }

	it('hides deletion while the list has an active trip', () => {
		const actions = getListCardMenuActions({ ...callbacks, hasActiveTrip: true })

		expect(actions.map(action => action.label)).toEqual(['Edit List', 'Share'])
	})

	it('offers deletion when the list has no active trip', () => {
		const actions = getListCardMenuActions({ ...callbacks, hasActiveTrip: false })

		expect(actions.map(action => action.label)).toEqual(['Edit List', 'Share', 'Delete List'])
	})
})
