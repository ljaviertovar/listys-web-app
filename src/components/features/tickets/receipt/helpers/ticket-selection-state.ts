export function mergeTicketSelection(selectedIds: ReadonlySet<string>, ids: readonly string[]): ReadonlySet<string> {
	return new Set([...selectedIds, ...ids])
}

/** Takes lines out of the selection, which is how "Undo" gives back what "Accept All" selected; the rest stays selected. */
export function removeFromTicketSelection(selectedIds: ReadonlySet<string>, ids: readonly string[]): ReadonlySet<string> {
	const drop = new Set(ids)
	return new Set([...selectedIds].filter(id => !drop.has(id)))
}
