'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { summarizeUser, type UserSummary } from '@/components/features/auth'

export interface NavSummary {
	user: UserSummary | null
	/** Groups the user owns; null until loaded. */
	groupsCount: number | null
	/** Receipts that were read but are not on a list yet; null until loaded. */
	receiptsWaiting: number | null
	/** Items collected out of all items in the running session; null when there is none or it is loading. */
	progress: { checked: number; total: number } | null
}

const EMPTY: NavSummary = { user: null, groupsCount: null, receiptsWaiting: null, progress: null }

interface Options {
	/** Nothing is fetched while false: the mobile menu is closed, or the sidebar is collapsed. */
	enabled: boolean
	sessionId: string | null
	/** Changes when the numbers may have changed (the page, the menu opening); the summary is fetched again. */
	refreshKey?: string | boolean
}

/**
 * What the navigation shows beyond the links: the account, the counts next to "Shopping List Groups" and "Receipts"
 * (the same ones the dashboard shows) and how far along the running session is. It loads only while `enabled`, so no
 * page pays for it until the menu is opened, and it fetches again whenever `refreshKey` changes.
 */
export function useNavSummary({ enabled, sessionId, refreshKey }: Options): NavSummary {
	const [summary, setSummary] = useState<NavSummary>(EMPTY)

	useEffect(() => {
		if (!enabled) return
		let cancelled = false

		const load = async () => {
			const supabase = createClient()
			const { data } = await supabase.auth.getUser()
			const user = data?.user
			if (!user) return

			const [groups, receipts, items] = await Promise.all([
				supabase.from('groups').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
				supabase
					.from('tickets')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.eq('ocr_status', 'completed')
					.is('base_list_id', null),
				sessionId
					? supabase.from('shopping_session_items').select('checked').eq('shopping_session_id', sessionId)
					: Promise.resolve(null),
			])

			if (cancelled) return
			setSummary({
				user: summarizeUser(user),
				groupsCount: groups.count ?? null,
				receiptsWaiting: receipts.count ?? null,
				progress: items?.data
					? { checked: items.data.filter(item => item.checked === true).length, total: items.data.length }
					: null,
			})
		}

		load().catch(() => {})
		return () => {
			cancelled = true
		}
	}, [enabled, sessionId, refreshKey])

	return summary
}
