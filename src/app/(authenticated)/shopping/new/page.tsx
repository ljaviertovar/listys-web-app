import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBaseList } from '@/actions/base-lists'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { CreateShoppingSessionForm } from '@/components/features/shopping-sessions/create-shopping-session-form'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'
import PageContainer from '@/components/app/page-container'

export default async function NewShoppingRunPage({ searchParams }: { searchParams: Promise<{ baseListId?: string }> }) {
	const { baseListId } = await searchParams
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	if (!baseListId) {
		redirect('/shopping-lists')
	}

	const { data: baseList, error } = await getBaseList(baseListId)

	if (error || !baseList) {
		redirect('/shopping-lists')
	}

	// Check if there's already an active shopping session
	const { data: activeSession, error: sessionError } = await supabase
		.from('shopping_sessions')
		.select('id')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.single()

	// If there's an active session, redirect to it
	if (activeSession && !sessionError) {
		redirect(`/shopping/${activeSession.id}`)
	}

	return (
		<>
			<PageHeader
				title='Start Shopping Run'
				desc={`Create a new shopping run from "${baseList.name}"`}
			/>
			<PageContainer>
				<BackLink
					href={`/shopping-lists/${baseList.group_id}/lists`}
					label='Back to Lists'
				/>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
							/>
							New Shopping Run
						</CardTitle>
						<CardDescription>
							This will copy all items from your base list to a new active shopping session
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CreateShoppingSessionForm
							baseListId={baseListId}
							defaultName={baseList.name}
						/>
					</CardContent>
				</Card>
			</PageContainer>
		</>
	)
}
