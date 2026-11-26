import { describe, expect, it } from 'vitest'

import { applyNeededOverrides, settleOverride, startOverrides } from '../items/helpers/needed-overrides'

const items = [{ id: 'a', needed_at: null as string | null }, { id: 'b', needed_at: '2026-11-26T10:00:00.000Z' }]
const checked = (overrides: Parameters<typeof applyNeededOverrides>[1]) =>
	applyNeededOverrides(items, overrides).map(item => Boolean(item.needed_at))

describe('needed overrides', () => {
	it('shows a check before it is saved', () => {
		expect(checked(startOverrides({}, ['a'], true))).toEqual([true, true])
	})

	it('drops back to the server value when the only write fails', () => {
		const pending = startOverrides({}, ['a', 'b'], false)

		expect(checked(settleOverride(pending, ['a', 'b'], true))).toEqual([false, true])
	})

	it('keeps the newest tap while its own write is still in flight', () => {
		const twice = startOverrides(startOverrides({}, ['a'], true), ['a'], false)
		const afterFirstFails = settleOverride(twice, ['a'], true)

		expect(afterFirstFails.a).toEqual({ needed: false, pending: 1 })
	})
})
