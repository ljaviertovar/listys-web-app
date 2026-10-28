// Radix needs a non-empty value for each item, so "every list" travels as this sentinel and never reaches the URL.
export const ALL_LISTS = 'all'

/** The URL after the user picks a list in the history filter: `?list=<id>`, or none for every list, other params kept. */
export function historyFilterHref(pathname: string, currentQuery: string, value: string) {
	const params = new URLSearchParams(currentQuery)
	if (value === ALL_LISTS) params.delete('list')
	else params.set('list', value)

	const query = params.toString()
	return query ? `${pathname}?${query}` : pathname
}
