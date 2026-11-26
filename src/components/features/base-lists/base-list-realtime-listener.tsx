'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isOwnRecentActivity } from '@/utils/local-activity'

import { isOwnCheckEcho, requestListRefresh } from './items/sync/needed-sync-registry'

interface Props {
	baseListId: string
}

export function BaseListRealtimeListener({ baseListId }: Props) {
	const router = useRouter()

	useEffect(() => {
		if (!baseListId) return

		const supabase = createClient()
		// A change to many rows arrives as one event per row.
		const refresh = () => requestListRefresh(baseListId, () => router.refresh())
		// Unique ID per mount prevents StrictMode channel-name conflicts (TIMED_OUT).
		const channelId = `base_list_items_${baseListId}_${Math.random()}`

		const channel = supabase
			.channel(channelId)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'base_list_items', filter: `base_list_id=eq.${baseListId}` }, () => {
				if (!isOwnRecentActivity()) toast.info('A new item was added to the list')
				refresh()
			})
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'base_list_items', filter: `base_list_id=eq.${baseListId}` }, event => {
				if (!isOwnCheckEcho(baseListId, event.new)) refresh()
			})
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'base_list_items', filter: `base_list_id=eq.${baseListId}` }, () => {
				if (!isOwnRecentActivity()) toast.info('An item was removed from the list')
				refresh()
			})
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [baseListId, router])

	return null
}
