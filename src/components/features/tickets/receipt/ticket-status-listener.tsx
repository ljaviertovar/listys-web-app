'use client'

import { useRouter } from 'next/navigation'

import { TicketStatusChip } from '../ticket-status-chip'
import type { TicketStatus } from '../helpers/ticket-status'
import { useTicketStatus } from './hooks/use-ticket-status'

interface TicketStatusListenerProps {
	ticketId: string
	initialStatus: TicketStatus
}

/**
 * Renders the status chip and keeps it in sync via Realtime + polling.
 * Only triggers a full router.refresh() when the status reaches a terminal
 * state (completed / failed) so the page loads items without flickering.
 */
export function TicketStatusListener({ ticketId, initialStatus }: TicketStatusListenerProps) {
	const router = useRouter()
	const status = useTicketStatus({ ticketId, initialStatus, onTerminal: () => router.refresh() })

	return (
		<span data-testid='ticket-status-announcement' role='status' aria-live='polite' aria-atomic='true'>
			<TicketStatusChip
				status={status}
				testId='ticket-status-listener'
			/>
		</span>
	)
}
