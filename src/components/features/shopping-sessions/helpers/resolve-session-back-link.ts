/**
 * Where the back link of a shopping session leads: to the history when the user came from it (keeping the list the history
 * was narrowed to), otherwise to the lists. `history-group` is the origin that links made before groups were hidden still
 * carry; it leads to the history too, without a list.
 */
export function resolveSessionBackLink(origin?: string, listId?: string) {
	if (origin === 'history' || origin === 'history-group') {
		const query = origin === 'history' && listId ? `?list=${encodeURIComponent(listId)}` : ''
		return { href: `/shopping-history${query}`, label: 'Back to Shopping History' }
	}

	return { href: '/shopping-lists', label: 'Back to Lists' }
}
