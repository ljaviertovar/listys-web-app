import { describe, expect, it, vi } from 'vitest'

import { runOptimisticSessionItemToggle, SESSION_ITEM_TOGGLE_ERROR_COPY } from '@/components/features/shopping-sessions/hooks/use-session-item-actions'

describe('runOptimisticSessionItemToggle', () => {
	it('restores the previous checked state and clears loading when the update fails', async () => {
		let checked = false
		let toggling = false
		const setChecked = vi.fn((value: boolean | ((current: boolean) => boolean)) => {
			checked = typeof value === 'function' ? value(checked) : value
		})
		const setToggling = vi.fn((value: boolean | ((current: boolean) => boolean)) => {
			toggling = typeof value === 'function' ? value(toggling) : value
		})
		const onError = vi.fn()

		await runOptimisticSessionItemToggle({
			nextChecked: true,
			setChecked,
			setToggling,
			update: async () => ({ error: 'offline' }),
			onSuccess: vi.fn(),
			onError,
		})

		expect(setChecked).toHaveBeenNthCalledWith(1, true)
		expect(setChecked).toHaveBeenNthCalledWith(2, false)
		expect(checked).toBe(false)
		expect(toggling).toBe(false)
		expect(onError).toHaveBeenCalledWith(new Error('offline'))
		expect(SESSION_ITEM_TOGGLE_ERROR_COPY.title).toBe('Could not update item')
		expect(SESSION_ITEM_TOGGLE_ERROR_COPY.description).toContain('returned to its previous state')
	})

	it('keeps the optimistic state and calls success when the update succeeds', async () => {
		let checked = false
		let toggling = false
		const setChecked = (value: boolean | ((current: boolean) => boolean)) => {
			checked = typeof value === 'function' ? value(checked) : value
		}
		const setToggling = (value: boolean | ((current: boolean) => boolean)) => {
			toggling = typeof value === 'function' ? value(toggling) : value
		}
		const onSuccess = vi.fn()
		const onError = vi.fn()

		await runOptimisticSessionItemToggle({
			nextChecked: true,
			setChecked,
			setToggling,
			update: async () => ({}),
			onSuccess,
			onError,
		})

		expect(checked).toBe(true)
		expect(toggling).toBe(false)
		expect(onSuccess).toHaveBeenCalledOnce()
		expect(onError).not.toHaveBeenCalled()
	})
})
