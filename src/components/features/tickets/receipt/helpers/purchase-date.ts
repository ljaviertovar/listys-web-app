/** The earliest purchase date the server accepts; anything before it is a typing slip, not a receipt. */
export const EARLIEST_PURCHASE_DAY = '1900-01-01'

const dayFormat = (timeZone: string) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })

/** The calendar day (YYYY-MM-DD) an instant falls on in a time zone: the same day the receipt line shows. */
export function dayInTimeZone(instant: Date | string, timeZone: string): string {
	const date = typeof instant === 'string' ? new Date(instant) : instant
	return Number.isFinite(date.getTime()) ? dayFormat(timeZone).format(date) : ''
}

/** The weekday of a calendar day, so the person can check it against the paper. */
export function weekdayOfDay(day: string): string {
	const date = new Date(`${day}T00:00:00Z`)
	// A date input can hold a six-digit year that is not a valid date to JavaScript.
	return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(date) : ''
}

/** Why a day cannot be saved, or null when it can. `today` is the person's own today. */
export function purchaseDayProblem(day: string, today: string): string | null {
	if (day > today) return 'The purchase date can’t be after today.'
	if (day < EARLIEST_PURCHASE_DAY) return 'Use a real date.'
	return null
}

/**
 * What the helper says once a day is saved. A receipt that counts in spending moves with its date, so when the day lands in
 * another month the helper says which one instead of leaving the person to wonder where the amount went.
 */
export function describeSavedDay({ savedDay, previousDay, countsInSpending, currentYear }: {
	savedDay: string
	previousDay: string
	countsInSpending: boolean
	currentYear: number
}): string {
	if (!countsInSpending || savedDay.slice(0, 7) === previousDay.slice(0, 7)) return 'Saved.'
	const month = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(new Date(`${savedDay}T00:00:00Z`))
	const year = Number(savedDay.slice(0, 4))
	return `Saved. This receipt now counts in ${month}${year === currentYear ? '' : ` ${year}`}.`
}
