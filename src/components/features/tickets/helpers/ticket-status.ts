import { Alert02Icon, CancelCircleIcon, CheckmarkCircle02Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

export type TicketStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface TicketStatusMeta {
	label: string
	/** `null` draws the neutral dot of a receipt that has not started yet. */
	icon: IconSvgElement | null
	/** Tinted surface (the 100-level of the status colour) with the 700-level text and icon; the label and the icon say it too, so colour never carries it alone. */
	tone: string
}

export const TICKET_STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
	pending: { label: 'Waiting to Read', icon: null, tone: 'bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground' },
	processing: { label: 'Reading Receipt', icon: Clock01Icon, tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
	completed: { label: 'Ready to Review', icon: CheckmarkCircle02Icon, tone: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' },
	failed: { label: 'Failed', icon: CancelCircleIcon, tone: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' },
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
