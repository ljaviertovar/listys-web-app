import { ensureDefaultPantry } from '@/lib/server/services/default-pantry.service'
import { getActiveShoppingSession, getBaseLists, getGroups, getShoppingHistory, getTickets } from '@/lib/api/endpoints'
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
	const [userResult, groupsResult, baseListsResult, ticketsResult, historyResult, activeSessionResult] =
		await Promise.all([
			supabase.auth.getUser(),
			getGroups(),
			getBaseLists(),
			getTickets(),
			getShoppingHistory(),
			getActiveShoppingSession(),
		])

	// A failed request must not be shown as an empty account: with no data the page would invite the user to start from scratch.
	if ([groupsResult, baseListsResult, ticketsResult, historyResult, activeSessionResult].some(result => result.error)) {
		return <DashboardLoadError />
	}

	const user = userResult.data.user
	const activeSession = (activeSessionResult.data ?? null) as DashboardInput['activeSession']
	const baseLists = baseListsResult.data ?? []

	const model = buildDashboardModel({
		groups: groupsResult.data ?? [],
		baseLists,
		tickets: ticketsResult.data ?? [],
		trips: historyResult.data ?? [],
		activeSession,
	})

	return (
		<DashboardView
			model={model}
			firstName={firstNameOf(user)}
			hasLists={baseLists.length > 0}
			isGuest={!!user && !!activeSession && (activeSessionResult.data as { user_id?: string }).user_id !== user.id}
		/>
	)
}
