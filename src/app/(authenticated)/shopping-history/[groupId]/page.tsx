import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getShoppingHistory } from '@/actions/shopping-sessions'
import { getGroup } from '@/actions/shopping-lists'
import { Card, CardContent } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import { HistorySessionCard } from '@/components/features/shopping-sessions/history-session-card'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'
import PageContainer from '@/components/app/page-container'

export default async function GroupHistoryPage({ params }: { params: Promise<{ groupId: string }> }) {
	const { groupId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: group, error: groupError } = await getGroup(groupId)
	const { data: allSessions, error: sessionsError } = await getShoppingHistory()

	if (groupError || !group) {
		redirect('/shopping-history')
	}

	// Filter sessions for this specific group
	const sessions = allSessions?.filter(session => session.base_list?.group?.id === groupId) || []

	return (
		<>
			<PageHeader
				title={group.name}
				desc={group.description || 'Shopping history for this group'}
			/>
			<PageContainer>
				<BackLink
					href='/shopping-history'
					label='Back to Shopping History'
				/>

				{sessionsError && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
						Error loading history: {sessionsError}
					</div>
				)}

				{sessions.length === 0 ? (
					<Card className='flex min-h-100 flex-col items-center justify-center'>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={ShoppingBasket01Icon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No shopping history yet</h3>
								<p className='text-sm text-muted-foreground'>
									Complete shopping sessions from this group's lists to see them here
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4'>
						{sessions.map(session => (
							<HistorySessionCard
								key={session.id}
								session={session}
							/>
						))}
					</div>
				)}
			</PageContainer>
		</>
	)
}
