'use client'

import { useEffect, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import type { TicketStatus } from '../../helpers/ticket-status'
import { applyTicketStatusUpdate } from '../helpers/ticket-status-update'

interface UseTicketStatusOptions {
	ticketId: string
	initialStatus: TicketStatus
	/** Called once, when the receipt first reaches a terminal status (read or failed), so the page can load what it produced. */
	onTerminal?: (status: TicketStatus) => void
}

/** Follows a receipt's reading status with Realtime plus a 3 s poll as fallback; nothing runs once the status is already terminal. */
export function useTicketStatus({ ticketId, initialStatus, onTerminal }: UseTicketStatusOptions): TicketStatus {
	const [status, setStatus] = useState<TicketStatus>(initialStatus)
	const hasRefreshed = useRef(false)
	// The latest callback without restarting the subscription whenever the caller re-renders.
	const onTerminalRef = useRef(onTerminal)
	useEffect(() => {
		onTerminalRef.current = onTerminal
	})

	useEffect(() => {
		// If the server already sent a terminal status, no need to poll
		if (initialStatus === 'completed' || initialStatus === 'failed') return
		if (!ticketId) return

		const supabase = createClient()

		const handleStatusUpdate = (raw: string | null) => {
			if (!raw) return
			const update = applyTicketStatusUpdate(raw, hasRefreshed.current)
			setStatus(update.status)
			if (update.refresh) {
				hasRefreshed.current = true
				onTerminalRef.current?.(update.status)
			}
		}

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
	}, [ticketId, initialStatus])

	return status
}
