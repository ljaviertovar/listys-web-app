const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** "Mar 2026": the month and year of the oldest receipt. */
export function formatFirstReceipt(firstReceiptAt: string | null | undefined): string | null {
	if (!firstReceiptAt) return null
	const date = new Date(firstReceiptAt)
	if (Number.isNaN(date.getTime())) return null
	return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: DATE_ONLY.test(firstReceiptAt) ? 'UTC' : undefined }).format(date)
}

/** "Oct 28", or "Oct 28, 2025" when it is from a different year. */
export function formatLastReceipt(lastReceiptAt: string | null | undefined, now: Date = new Date()): string | null {
	if (!lastReceiptAt) return null
	const date = new Date(lastReceiptAt)
	if (Number.isNaN(date.getTime())) return null
	const calendarDate = DATE_ONLY.test(lastReceiptAt)
	const sameYear = (calendarDate ? date.getUTCFullYear() : date.getFullYear()) === now.getFullYear()
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: calendarDate ? 'UTC' : undefined, ...(sameYear ? {} : { year: 'numeric' }) }).format(date)
}
