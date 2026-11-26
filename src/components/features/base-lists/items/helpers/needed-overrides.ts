/** A check made on this screen that the server data may not show yet. `pending` counts the writes still in flight. */
export type NeededOverrides = Record<string, { needed: boolean; pending: number }>

/** Stands in for the date of a check until the server sends the real one. Only its presence is ever read. */
const UNSAVED_DATE = new Date(0).toISOString()

export function applyNeededOverrides<T extends { id: string; needed_at: string | null }>(items: T[], overrides: NeededOverrides): T[] {
	return items.map(item => {
		const override = overrides[item.id]
		if (!override || override.needed === Boolean(item.needed_at)) return item
		return { ...item, needed_at: override.needed ? UNSAVED_DATE : null }
	})
}

export function startOverrides(current: NeededOverrides, ids: string[], needed: boolean): NeededOverrides {
	const next = { ...current }
	for (const id of ids) next[id] = { needed, pending: (current[id]?.pending ?? 0) + 1 }
	return next
}

/** One write finished. A failed one drops back to the server value unless a newer write for the item is still on its way. */
export function settleOverride(current: NeededOverrides, ids: string[], failed: boolean): NeededOverrides {
	const next = { ...current }
	for (const id of ids) {
		const override = next[id]
		if (!override) continue
		const pending = Math.max(0, override.pending - 1)
		if (failed && pending === 0) delete next[id]
		else next[id] = { ...override, pending }
	}
	return next
}
