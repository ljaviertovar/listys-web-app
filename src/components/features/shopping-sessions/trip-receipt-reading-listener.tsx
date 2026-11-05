'use client'

import { useRouter } from 'next/navigation'
import { useTicketStatus } from '@/components/features/tickets/receipt/hooks/use-ticket-status'

/** Subscription only: the receipt card's title already announces the reading state. */
export function TripReceiptReadingListener({ ticketId }: { ticketId: string }) {
	const router = useRouter()
	useTicketStatus({ ticketId, initialStatus: 'processing', onTerminal: () => router.refresh() })
	return null
}
