import { formatShortDate } from '@/utils'
import type { DataFact } from '@/components/commons'

/**
 * The data line of a list card: when it was last shopped, or that it never was, with the year only when it is not this year. Who it is
 * shared with is a tag, not data.
 */
export function buildListCardFacts(lastTripAt: string | null | undefined, now = new Date()): DataFact[] {
	return [{ value: lastTripAt ? `Last trip ${formatShortDate(new Date(lastTripAt), now)}` : 'No trips yet' }]
}

/** The text of the "Shared with" tag, or null when the list is not shared. */
export function buildSharedWithLabel(sharedWithCount: number | undefined): string | null {
	if (!sharedWithCount || sharedWithCount <= 0) return null
	return `Shared with ${sharedWithCount} ${sharedWithCount === 1 ? 'person' : 'people'}`
}
