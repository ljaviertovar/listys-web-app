import { Alert02Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

export type TicketStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface TicketStatusMeta {
	label: string
	/** The `Badge` variant that tints the pill (the 100-level of the status colour with the 700-level text and dot); the label says it too, so colour never carries it alone. */
	variant: 'neutral' | 'processing' | 'completed' | 'failed'
}

export const TICKET_STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
	pending: { label: 'Pending', variant: 'neutral' },
	processing: { label: 'Reading', variant: 'processing' },
	completed: { label: 'Processed', variant: 'completed' },
	failed: { label: 'Failed', variant: 'failed' },
}

/** Icon beside the one-line status message of a receipt card. */
export const TICKET_STATUS_NOTE_ICON: Partial<Record<TicketStatus, IconSvgElement>> = {
	pending: Clock01Icon,
	failed: Alert02Icon,
}

/** The database column is nullable and free text, so anything unknown reads as not started. */
export function toTicketStatus(raw: string | null | undefined, itemCount?: number | null): TicketStatus {
	if (raw === 'completed' && itemCount === 0) return 'failed'
	return raw === 'processing' || raw === 'completed' || raw === 'failed' ? raw : 'pending'
}

/** A receipt that finished reading but found no item lines: it was read, so it is not an error, though it has nothing to review. */
export function isReadWithoutItems(raw: string | null | undefined, itemCount?: number | null): boolean {
	return raw === 'completed' && itemCount === 0
}

/** The status shown on a receipt's chip: `toTicketStatus`, except that a receipt read without items is still "Processed". */
export function toTicketChipStatus(raw: string | null | undefined, itemCount?: number | null): TicketStatus {
	return isReadWithoutItems(raw, itemCount) ? 'completed' : toTicketStatus(raw, itemCount)
}
