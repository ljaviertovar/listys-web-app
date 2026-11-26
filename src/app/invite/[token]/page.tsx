import { redirect } from 'next/navigation'

import { AuthButtons } from '@/components/features/auth'
import { InviteScreen } from '@/components/features/sharing'
import { createClient } from '@/lib/supabase/server'

interface Props {
	params: Promise<{ token: string }>
}

/** The invitation to a shared list: it asks for a session, and joining waits for the button on the screen. */
export default async function InviteAcceptPage({ params }: Props) {
	const { token } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect(`/auth/signin?next=/invite/${encodeURIComponent(token)}`)
	}

	return (
		<InviteScreen
			token={token}
			account={<AuthButtons />}
		/>
	)
}
