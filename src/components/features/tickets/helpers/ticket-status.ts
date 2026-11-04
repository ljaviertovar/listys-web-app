import { Alert02Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

export type TicketStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface TicketStatusMeta {
	label: string
	/** Tinted surface (the 100-level of the status colour) with the 700-level text and dot; the label says it too, so colour never carries it alone. */
	tone: string
}

export const TICKET_STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
	pending: { label: 'Waiting to Read', tone: 'bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground' },
	processing: { label: 'Reading Receipt', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
	completed: { label: 'Ready to Review', tone: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' },
	failed: { label: 'Failed', tone: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' },
}

/** Icon beside the one-line status message of a receipt card. */
export const TICKET_STATUS_NOTE_ICON: Partial<Record<TicketStatus, IconSvgElement>> = {
	pending: Clock01Icon,
	failed: Alert02Icon,
}

/** The database column is nullable and free text, so anything unknown reads as not started. */
export function toTicketStatus(raw: string | null | undefined): TicketStatus {
	return raw === 'processing' || raw === 'completed' || raw === 'failed' ? raw : 'pending'
}
