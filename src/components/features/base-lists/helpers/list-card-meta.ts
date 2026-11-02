import { formatDate } from '@/utils'

/** The quiet line of a list card: when it was last shopped (or that it never was) and, if it is shared, with how many people. */
export function buildListCardMeta(lastTripAt: string | null | undefined, sharedWithCount: number | undefined): string {
	const trip = lastTripAt ? `Last trip ${formatDate(new Date(lastTripAt))}` : 'No trips yet'
	if (!sharedWithCount || sharedWithCount <= 0) return trip
	return `${trip} · Shared with ${sharedWithCount} ${sharedWithCount === 1 ? 'person' : 'people'}`
}
