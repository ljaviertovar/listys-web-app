'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { summarizeUser, type UserSummary } from '@/components/features/auth'
import { useSessionProgress } from '../active-session/hooks/use-session-progress'

export interface NavSummary {
	user: UserSummary | null
	/** Lists the user owns; null until loaded. */
	listsCount: number | null
	/** Receipts that were read but are not on a list yet; null until loaded. */
	receiptsWaiting: number | null
	/** Items collected out of all items in the running session; null when there is none or it is loading. */
	progress: { checked: number; total: number } | null
}

const EMPTY: NavSummary = { user: null, listsCount: null, receiptsWaiting: null, progress: null }

interface Options {
	/** Navigation metadata is fetched only while expanded; trip progress stays shared. */
	enabled: boolean
	sessionId: string | null
	/** Changes when the numbers may have changed (the page, the menu opening); the summary is fetched again. */
	refreshKey?: string | boolean
}

/**
 * What the navigation shows beyond the links: the account, the counts next to "Shopping Lists" and "Receipts"
 * (the same ones the dashboard shows). Metadata loads while enabled and refreshes on navigation;
 * trip progress comes from the shared optimistic state instead of a separate database read.
 */
export function useNavSummary({ enabled, sessionId, refreshKey }: Options): NavSummary {
	const [summary, setSummary] = useState<NavSummary>(EMPTY)
	const progress = useSessionProgress(sessionId, String(refreshKey ?? ''))

	useEffect(() => {
		if (!enabled) return
		let cancelled = false

		const load = async () => {
			const supabase = createClient()
			const { data } = await supabase.auth.getUser()
			const user = data?.user
			if (!user) return

			const [lists, receipts] = await Promise.all([
				supabase.from('base_lists').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
				supabase
					.from('tickets')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.eq('ocr_status', 'completed')
					.is('base_list_id', null),
			])

			if (cancelled) return
			setSummary({
				user: summarizeUser(user),
				listsCount: lists.count ?? null,
				receiptsWaiting: receipts.count ?? null,
				progress: null,
			})
		}

		load().catch(() => {})
		return () => {
			cancelled = true
		}
	}, [enabled, sessionId, refreshKey])

	return { ...summary, progress }
}
