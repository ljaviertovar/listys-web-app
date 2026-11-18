/** "Mar 2026": the month and year the oldest receipt was added, in the viewer's time zone; null when there is none or it is not a date. */
export function formatFirstReceipt(firstReceiptAt: string | null | undefined): string | null {
	if (!firstReceiptAt) return null
	const date = new Date(firstReceiptAt)
	if (Number.isNaN(date.getTime())) return null
	return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}
