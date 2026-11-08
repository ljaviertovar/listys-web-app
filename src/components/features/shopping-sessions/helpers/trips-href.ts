export const TRIPS_PATH = '/trips'

/** Where the trips list lives, narrowed to a list when one is given. */
export function tripsHref(listId?: string | null) {
	return listId ? `${TRIPS_PATH}?list=${encodeURIComponent(listId)}` : TRIPS_PATH
}
