'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
	ticketId: string
}

export function TicketStatusListener({ ticketId }: Props) {
	const router = useRouter()

	useEffect(() => {
		if (!ticketId) return

		const supabase = createClient()

		// Realtime subscription (optional) - try to refresh immediately on updates
		const channel = supabase
			.channel(`ticket_status_${ticketId}`)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` },
				() => {
					try {
						router.refresh()
					} catch (e) {
						console.error('Failed to refresh router on ticket update', e)
					}
				},
			)
			.subscribe()

		// Polling fallback: query our server API every 3s until it's completed/failed
		// Use a server-side route to avoid RLS/auth issues from the browser client
		let currentStatus: string | null = null
		const interval = setInterval(async () => {
			try {
				const res = await fetch(`/api/tickets/${ticketId}/status`, { cache: 'no-store' })
				if (!res.ok) {
					console.debug('Ticket status API returned', res.status)
					return
				}
				const json = await res.json()
				const status = json?.ocr_status || null
				if (!currentStatus) currentStatus = status
				if (status && currentStatus !== status) {
					currentStatus = status
					router.refresh()
				}
				if (status === 'completed' || status === 'failed') {
					clearInterval(interval)
				}
			} catch (e) {
				console.debug('Polling error', e)
			}
		}, 3000)

		return () => {
			try {
				supabase.removeChannel(channel)
			} catch (e) {
				// fallback: unsubscribe if removeChannel not available
				channel.unsubscribe().catch(() => {})
			}
			clearInterval(interval)
		}
	}, [ticketId, router])

	return null
}
