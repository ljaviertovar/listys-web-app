/** "Mar 2026": the month and year the oldest receipt was added, in the viewer's time zone; null when there is none or it is not a date. */
export function formatFirstReceipt(firstReceiptAt: string | null | undefined): string | null {
	if (!firstReceiptAt) return null
	const date = new Date(firstReceiptAt)
	if (Number.isNaN(date.getTime())) return null
	return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

/** "Oct 28", or "Oct 28, 2025" when it is not this year: the day the newest receipt was added, in the viewer's time zone; null when there is none or it is not a date. */
export function formatLastReceipt(lastReceiptAt: string | null | undefined, now: Date = new Date()): string | null {
	if (!lastReceiptAt) return null
	const date = new Date(lastReceiptAt)
	if (Number.isNaN(date.getTime())) return null
	const sameYear = date.getFullYear() === now.getFullYear()
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) }).format(date)
}
