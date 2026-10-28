export function mergeTicketSelection(selectedIds: ReadonlySet<string>, ids: readonly string[]): ReadonlySet<string> {
	return new Set([...selectedIds, ...ids])
}
