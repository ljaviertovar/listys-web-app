/** The trip date uses local calendar parts, so a late UTC receipt stays on the user's own shopping day. */
export function formatTripDate(date: Date, now = new Date(), timeZone?: string): string {
	const formatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone })
	const parts = new Map(formatter.formatToParts(date).map(part => [part.type, part.value]))
	const currentYear = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone }).format(now)
	return `${parts.get('weekday')} ${parts.get('day')} ${parts.get('month')}${parts.get('year') === currentYear ? '' : ` ${parts.get('year')}`}`
}
