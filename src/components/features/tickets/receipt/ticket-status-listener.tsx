'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

import { TicketStatusChip } from '../ticket-status-chip'
import type { TicketStatus } from '../helpers/ticket-status'

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
	const [status, setStatus] = useState<TicketStatus>(initialStatus)
	const hasRefreshed = useRef(false)

	useEffect(() => {
		// If the server already sent a terminal status, no need to poll
		if (initialStatus === 'completed' || initialStatus === 'failed') return
		if (!ticketId) return

		const supabase = createClient()

		const handleStatusUpdate = (newStatus: string | null) => {
			if (!newStatus) return
			const s = newStatus as TicketStatus

			// Always update badge text
			setStatus(s)

			// Full page refresh only on terminal states (loads items/error from server)
			if (!hasRefreshed.current && (s === 'completed' || s === 'failed')) {
				hasRefreshed.current = true
				router.refresh()
			}
		}

		// Realtime subscription
		const channel = supabase
			.channel(`ticket_status_${ticketId}`)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` },
				payload => {
					handleStatusUpdate((payload.new as { ocr_status?: string | null } | null)?.ocr_status ?? null)
				},
			)
			.subscribe()

		// Polling fallback every 3s
		const interval = setInterval(async () => {
			if (hasRefreshed.current) {
				clearInterval(interval)
				return
			}
			try {
				const res = await fetch(`/api/tickets/${ticketId}/status`, { cache: 'no-store' })
				if (!res.ok) return
				const json = await res.json()
				handleStatusUpdate(json?.ocr_status ?? null)
			} catch (e) {
				console.debug('Polling error', e)
			}
		}, 3000)

		return () => {
			try {
				supabase.removeChannel(channel)
			} catch {
				channel.unsubscribe().catch(() => {})
			}
			clearInterval(interval)
		}
	}, [ticketId, initialStatus, router])

	return (
		<span data-testid='ticket-status-announcement' role='status' aria-live='polite' aria-atomic='true'>
			<TicketStatusChip
				status={status}
				testId='ticket-status-listener'
			/>
		</span>
	)
}
