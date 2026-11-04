import { formatDate } from '@/utils'

/** The data line of a list card: when it was last shopped, or that it never was. Who it is shared with is a tag, not data. */
export function buildListCardMeta(lastTripAt: string | null | undefined): string {
	return lastTripAt ? `Last trip ${formatDate(new Date(lastTripAt))}` : 'No trips yet'
}

/** The text of the "Shared with" tag, or null when the list is not shared. */
export function buildSharedWithLabel(sharedWithCount: number | undefined): string | null {
	if (!sharedWithCount || sharedWithCount <= 0) return null
	return `Shared with ${sharedWithCount} ${sharedWithCount === 1 ? 'person' : 'people'}`
}
