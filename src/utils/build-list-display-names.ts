interface NamedList {
	id: string
	name: string
	created_at?: string | null
}

const nameKey = (name: string) => name.trim().toLowerCase()

/**
 * The name each list is shown with. Lists made while names were unique per group can share a name, so the older one
 * keeps it and the next ones read "Weekly (2)", "Weekly (3)". Only the screen changes: the stored name is never
 * rewritten, and editors and requests keep using it.
 */
export function buildListDisplayNames(lists: readonly NamedList[]): Map<string, string> {
	const byName = new Map<string, NamedList[]>()
	for (const list of lists) {
		const key = nameKey(list.name)
		byName.set(key, [...(byName.get(key) ?? []), list])
	}

	const names = new Map<string, string>()
	for (const sameName of byName.values()) {
		// Oldest first, with the id as a tiebreak, so a suffix never moves when an unrelated list is added.
		const ordered = [...sameName].sort(
			(a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? '') || a.id.localeCompare(b.id),
		)
		ordered.forEach((list, index) => names.set(list.id, index === 0 ? list.name : `${list.name} (${index + 1})`))
	}
	return names
}
