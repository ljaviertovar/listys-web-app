import type { ComponentProps } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGroup, getShoppingHistory } from '@/lib/api/endpoints'
import { Card } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import { HistorySessionCard } from '@/components/features/shopping-sessions'
import { PageHeader, PageContainer } from '@/components/app'

/** A history row as the card takes it; the history endpoint is not typed yet. */
type HistorySession = ComponentProps<typeof HistorySessionCard>['session'] & {
	base_list?: { group?: { id?: string } | null } | null
}

export default async function GroupHistoryPage({ params }: { params: Promise<{ groupId: string }> }) {
	const { groupId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const [groupResult, sessionsResult] = await Promise.all([getGroup(groupId), getShoppingHistory()])

	const { data: group, error: groupError } = groupResult
	const { data: allSessions, error: sessionsError } = sessionsResult

	if (groupError || !group) {
		redirect('/shopping-history')
	}

	// Filter sessions for this specific group
	const sessions = allSessions?.filter((session: HistorySession) => session.base_list?.group?.id === groupId) || []

	return (
		<>
			<PageHeader
				variant='screen'
				title={group.name}
				desc={group.description || 'Shopping history for this group'}
				back={{ href: '/shopping-history', label: 'Back to Shopping History' }}
			/>
			<PageContainer>
				{sessionsError && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
						Error loading history: {sessionsError}
					</div>
				)}

				{sessions.length === 0 ? (
					<Card size='tight'>
						<div className='flex min-h-[152px] flex-col items-center justify-center gap-3 px-0.5 pt-2.5 pb-0.5 text-center'>
							<span
								className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700'
								aria-hidden='true'
							>
								<HugeiconsIcon
									icon={ShoppingBasket01Icon}
									strokeWidth={1.5}
									className='size-6.5'
								/>
							</span>
							<div className='flex flex-col gap-1.5'>
								<h3 className='text-base font-semibold tracking-tight'>No shopping history yet</h3>
								<p className='mx-auto max-w-[280px] text-sm leading-[1.55] text-slate-500'>
									Complete shopping sessions from this group&apos;s lists to see them here
								</p>
							</div>
						</div>
					</Card>
				) : (
					<div className='grid gap-4'>
						{sessions.map((session: HistorySession) => (
							<HistorySessionCard
								key={session.id}
								session={session}
								href={`/shopping/${session.id}?from=history-group&groupId=${groupId}`}
							/>
						))}
					</div>
				)}
			</PageContainer>
		</>
	)
}
