'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
	baseListId: string
}

export function BaseListRealtimeListener({ baseListId }: Props) {
	const router = useRouter()

	useEffect(() => {
		if (!baseListId) return

		const supabase = createClient()
		// Unique ID per mount prevents StrictMode channel-name conflicts (TIMED_OUT).
		const channelId = `base_list_items_${baseListId}_${Math.random()}`

		const channel = supabase
			.channel(channelId)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'base_list_items', filter: `base_list_id=eq.${baseListId}` }, () => {
				toast.info('A new item was added to the list')
				router.refresh()
			})
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'base_list_items', filter: `base_list_id=eq.${baseListId}` }, () => {
				toast.info('List updated')
				router.refresh()
			})
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'base_list_items', filter: `base_list_id=eq.${baseListId}` }, () => {
				toast.info('An item was removed from the list')
				router.refresh()
			})
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [baseListId, router])

	return null
}
