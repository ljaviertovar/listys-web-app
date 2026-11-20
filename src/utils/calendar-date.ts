/** Convert an instant into the first date whose local midnight is at or after the instant. */
export function calendarDateBoundary(instant: string, timeZone: string): string {
	const date = new Date(instant)
	const format = new Intl.DateTimeFormat('en', {
		timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
	})
	const parts = format.formatToParts(date)
	const part = (name: Intl.DateTimeFormatPartTypes) => parts.find(entry => entry.type === name)?.value ?? ''
	const day = `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`
	// Some clock changes skip midnight, so check when the calendar day actually changes.
	if (format.format(date) !== format.format(date.getTime() - 1)) return day

	const nextDay = new Date(`${day}T00:00:00Z`)
	nextDay.setUTCDate(nextDay.getUTCDate() + 1)
	return `${String(nextDay.getUTCFullYear()).padStart(4, '0')}-${nextDay.toISOString().split('T')[0].slice(-5)}`
}
