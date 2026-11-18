import { createClient } from '@/lib/supabase/server'

import { DashboardGreeting } from './dashboard-greeting'

function firstNameOf(user: { email?: string; user_metadata?: Record<string, unknown> } | null) {
	const metadata = user?.user_metadata
	const fullName = (metadata?.name as string | undefined) || (metadata?.full_name as string | undefined)
	return (fullName || user?.email?.split('@')[0] || 'there').trim().split(/\s+/)[0]
}

async function getGreetingName() {
	try {
		const supabase = await createClient()
		const { data: { user } } = await supabase.auth.getUser()
		return firstNameOf(user)
	} catch {
		return 'there'
	}
}

export async function DashboardGreetingContent() {
	const name = await getGreetingName()
	return <DashboardGreeting name={name} />
}
