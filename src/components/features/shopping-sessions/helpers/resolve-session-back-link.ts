import { tripsHref } from './trips-href'

/**
 * Where the back link of a shopping session leads: to the trips when the user came from them (keeping the list they were
 * narrowed to), otherwise to the lists. `history` and `history-group` are the origins that links made before the section was
 * renamed still carry; the group one leads to the trips without a list.
 */
export function resolveSessionBackLink(origin?: string, listId?: string) {
	if (origin === 'trips' || origin === 'history' || origin === 'history-group') {
		return { href: tripsHref(origin === 'history-group' ? null : listId), label: 'Back to Trips' }
	}

	return { href: '/shopping-lists', label: 'Back to Lists' }
}
