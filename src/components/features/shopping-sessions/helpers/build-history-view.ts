import { buildListDisplayNames } from '@/utils'

interface HistoryList {
	id: string
	name: string
	created_at?: string | null
}

interface HistoryTrip {
	base_list_id: string | null
}

export interface HistoryFilterOption {
	id: string
	name: string
}

/**
 * What the history screen shows for one `?list=` value. The filter offers only the lists that have at least one trip, named
 * the way the rest of the app names them (naming runs over every list, so "Weekly (2)" is the same list everywhere). A value
 * that is not one of those lists, whether unknown, someone else's or a list without trips, counts as "all": the screen never
 * says whether such a list exists.
 */
export function buildHistoryView<T extends HistoryTrip>({
	trips,
	lists,
	listParam,
}: {
	trips: readonly T[]
	lists: readonly HistoryList[]
	listParam?: string | null
}) {
	const displayNames = buildListDisplayNames(lists)
	const withTrips = new Set(trips.map(trip => trip.base_list_id).filter((id): id is string => Boolean(id)))

	const options: HistoryFilterOption[] = lists
		.filter(list => withTrips.has(list.id))
		.map(list => ({ id: list.id, name: displayNames.get(list.id) ?? list.name }))
		.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))

	const selectedListId = options.some(option => option.id === listParam) ? (listParam as string) : null

	return {
		options,
		selectedListId,
		trips: selectedListId ? trips.filter(trip => trip.base_list_id === selectedListId) : [...trips],
	}
}
