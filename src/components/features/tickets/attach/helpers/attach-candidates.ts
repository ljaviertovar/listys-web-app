import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import { formatDate, formatTime } from '@/utils'

type CandidateStore = Pick<TicketSessionCandidate, 'store'>

/**
 * Trips at the receipt's own store (or with no store yet) come first, in the order they arrived, because a trip recorded at
 * another store cannot take the receipt: the person should not have to read past them.
 */
export function sortCandidatesByStore<T extends CandidateStore>(candidates: T[], receiptStoreId: string | null | undefined): T[] {
	if (!receiptStoreId) return candidates
	const rank = (candidate: T) => (!candidate.store || candidate.store.id === receiptStoreId ? 0 : 1)
	return [...candidates].sort((a, b) => rank(a) - rank(b))
}

/** One line that tells the trips apart: its name, when it happened and where. */
export function describeCandidate(candidate: Pick<TicketSessionCandidate, 'name' | 'store' | 'started_at' | 'completed_at'>): string {
	const when = candidate.completed_at ?? candidate.started_at
	// Date and time, because several trips a day at one store are common and the day alone would not tell them apart.
	const date = when ? new Date(when) : null
	const parts = [candidate.name, date ? `${formatDate(date)} ${formatTime(date)}` : null, candidate.store?.name ?? null]
	return parts.filter(Boolean).join(' · ')
}
