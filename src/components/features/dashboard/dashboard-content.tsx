import { ensureDefaultPantry } from '@/lib/server/services/default-pantry.service'
import { getBaseLists, getShoppingHistory, getTickets } from '@/lib/api/endpoints'
import { createClient } from '@/lib/supabase/server'

import { DashboardLoadError } from './dashboard-load-error'
import { DashboardView } from './dashboard-view'
import { buildDashboardModel } from './helpers/build-dashboard-model'

type DashboardInput = Parameters<typeof buildDashboardModel>[0]

function firstNameOf(user: { email?: string; user_metadata?: Record<string, unknown> } | null) {
	const metadata = user?.user_metadata
	const fullName = (metadata?.name as string | undefined) || (metadata?.full_name as string | undefined)
	return (fullName || user?.email?.split('@')[0] || 'there').trim().split(/\s+/)[0]
}

/**
 * Loads everything the dashboard shows. A user with no lists first gets the default Pantry, awaited before the reads so
 * the very first visit already includes it (the layout renders in parallel with the page, so it cannot do this). The
 * provisioning never throws: if it fails the dashboard renders with the data that exists and tries again next visit.
 */
export async function DashboardContent() {
	await ensureDefaultPantry()

	const supabase = await createClient()
	const [userResult, baseListsResult, ticketsResult, historyResult, activeSessionsResult] =
		await Promise.all([
			supabase.auth.getUser(),
			getBaseLists(),
			getTickets(),
			getShoppingHistory(),
			supabase
				.from('shopping_sessions')
				.select(`
					*,
					items:shopping_session_items(*),
					base_list:base_lists(
						*,
						collaborators:list_collaborators(id, user_id, role, joined_at)
					),
					store:stores(id, name)
				`)
				.eq('status', 'active')
				.order('started_at', { ascending: false })
				.limit(100),
		])

	// A failed request must not be shown as an empty account: with no data the page would invite the user to start from scratch.
	if ([baseListsResult, ticketsResult, historyResult, activeSessionsResult].some(result => result.error)) {
		return <DashboardLoadError />
	}

	const user = userResult.data.user
	const activeSessions = (activeSessionsResult.data ?? []).map(session => {
		const baseList = session.base_list as { collaborators?: Array<{ user_id: string }> } | null
		return {
			...session,
			collaborators: (baseList?.collaborators ?? []).map(collaborator => ({
				initials: collaborator.user_id.slice(0, 2).toUpperCase(),
				display_name: null,
			})),
		}
	}) as DashboardInput['activeSessions']
	const baseLists = baseListsResult.data ?? []

	const model = buildDashboardModel({
		baseLists,
		tickets: ticketsResult.data ?? [],
		trips: historyResult.data ?? [],
		activeSession: activeSessions?.[0] ?? null,
		activeSessions,
	})

	return (
		<DashboardView
			model={model}
			firstName={firstNameOf(user)}
			hasLists={baseLists.length > 0}
			isGuest={!!user && !!activeSessionsResult.data?.[0] && activeSessionsResult.data[0].user_id !== user.id}
		/>
	)
}
