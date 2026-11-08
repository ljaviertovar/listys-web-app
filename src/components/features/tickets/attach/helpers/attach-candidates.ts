import type { TicketSessionCandidate } from '@/lib/api/endpoints'
import { formatDate, formatTime } from '@/utils'

/** One line that says which trip the receipt is being attached to: its name, when it happened and where. */
export function describeCandidate(candidate: Pick<TicketSessionCandidate, 'name' | 'store' | 'started_at' | 'completed_at'>): string {
	const when = candidate.completed_at ?? candidate.started_at
	// Date and time, because several trips a day at one store are common and the day alone would not tell them apart.
	const date = when ? new Date(when) : null
	const parts = [candidate.name, date ? `${formatDate(date)} ${formatTime(date)}` : null, candidate.store?.name ?? null]
	return parts.filter(Boolean).join(' · ')
}
