import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { acceptInvite } from '@/lib/server/services/sharing.service'
import { PageHeader, PageContainer } from '@/components/app'
import { Alert } from '@/components/ui/alert'

interface Props {
	params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: Props) {
	const { token } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect(`/auth/signin?next=/invite/${encodeURIComponent(token)}`)
	}

	let errorMessage: string | null = null
	let baseListId: string | null = null
	let listName: string | null = null

	try {
		const result = await acceptInvite(token)
		baseListId = result.base_list_id
		listName = result.list_name
	} catch (err) {
		errorMessage = err instanceof Error ? err.message : 'This invite link is invalid or has expired.'
	}

	// On success, redirect to the list detail page immediately
	if (baseListId) {
		redirect(`/base-lists/${baseListId}`)
	}

	return (
		<PageContainer>
			<PageHeader
				title='Join shared list'
				desc='You were invited to collaborate on a shopping list.'
			/>
			<Alert variant='destructive'>
				<p className='text-sm'>{errorMessage}</p>
			</Alert>
		</PageContainer>
	)
}
