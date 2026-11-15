export type TicketStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface TicketStatusMeta {
	label: string
	/** The `Badge` variant that sets the status text and dot color; the label says it too, so color never carries it alone. */
	variant: 'pending' | 'processing' | 'completed' | 'failed'
}

export const TICKET_STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
	pending: { label: 'Pending', variant: 'pending' },
	processing: { label: 'Reading', variant: 'processing' },
	completed: { label: 'Processed', variant: 'completed' },
	failed: { label: 'Failed', variant: 'failed' },
}

/** The database column is nullable and free text, so anything unknown reads as not started. */
export function toTicketStatus(raw: string | null | undefined, itemCount?: number | null): TicketStatus {
	if (raw === 'completed' && itemCount === 0) return 'failed'
	return raw === 'processing' || raw === 'completed' || raw === 'failed' ? raw : 'pending'
}

/** Keeps the specific no-items explanation available while the shared status remains failed. */
export function isReadWithoutItems(raw: string | null | undefined, itemCount?: number | null): boolean {
	return raw === 'completed' && itemCount === 0
}

/** The chip follows the readable state: a completed OCR pass with no items is a failed receipt. */
export function toTicketChipStatus(raw: string | null | undefined, itemCount?: number | null): TicketStatus {
	return toTicketStatus(raw, itemCount)
}
