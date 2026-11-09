'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isOwnRecentActivity } from '@/utils/local-activity'
import { sessionItemDtoSchema } from '@/lib/validations/shopping-session-item'

interface Props {
	sessionId: string
}

export function ShoppingSessionRealtimeListener({ sessionId }: Props) {
	const router = useRouter()

	useEffect(() => {
		if (!sessionId) return

		const supabase = createClient()
		// Unique ID per mount prevents StrictMode channel-name conflicts (TIMED_OUT).
		const channelId = `shopping_session_items_${sessionId}_${Math.random()}`

		const channel = supabase
			.channel(channelId)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shopping_session_items', filter: `shopping_session_id=eq.${sessionId}` }, () => {
				if (!isOwnRecentActivity()) toast.info('A new item was added to the list')
				router.refresh()
			})
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shopping_session_items', filter: `shopping_session_id=eq.${sessionId}` }, event => {
				const current = sessionItemDtoSchema.safeParse(event.new)
				const previous = sessionItemDtoSchema.safeParse(event.old)
				// Checks are reconciled by the shared store; only refresh display metadata.
				if (current.success && previous.success && (current.data.name !== previous.data.name || current.data.price !== previous.data.price || current.data.quantity !== previous.data.quantity)) router.refresh()
			})
			.on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_sessions', filter: `id=eq.${sessionId}` }, () => { router.refresh() })
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'shopping_session_items', filter: `shopping_session_id=eq.${sessionId}` }, () => {
				if (!isOwnRecentActivity()) toast.info('An item was removed from the list')
				router.refresh()
			})
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [sessionId, router])

	return null
}
