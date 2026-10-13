'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

export interface SessionProgress {
	checked: number
	total: number
}

/**
 * How many items of the running session are in the cart. It is read when the session or `refreshKey` changes (the bar
 * passes the page), so it is fresh each time the user comes back from the session screen; null until it loads.
 */
export function useSessionProgress(sessionId: string | null, refreshKey: string): SessionProgress | null {
	const [progress, setProgress] = useState<SessionProgress | null>(null)

	useEffect(() => {
		if (!sessionId) return
		let cancelled = false

		const load = async () => {
			const { data } = await createClient().from('shopping_session_items').select('checked').eq('shopping_session_id', sessionId)
			if (cancelled || !data) return
			setProgress({ checked: data.filter(item => item.checked === true).length, total: data.length })
		}

		load().catch(() => {})
		return () => {
			cancelled = true
		}
	}, [sessionId, refreshKey])

	return sessionId ? progress : null
}
