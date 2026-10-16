import type { ComponentProps } from 'react'
import { redirect } from 'next/navigation'

import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'

import { PageHeader, PageContainer } from '@/components/app'
import { GroupCard } from '@/components/features/shopping-lists'

import { getGroupsWithHistory } from '@/lib/api/endpoints'
import { createClient } from '@/lib/supabase/server'

export default async function HistoryPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: groups, error } = await getGroupsWithHistory()

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Shopping History'
				desc='View your past shopping sessions by group'
			/>

			<PageContainer>
				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading groups: {error}</div>
				)}

				{!groups || groups.length === 0 ? (
					<Card size='tight'>
						<div className='flex min-h-[152px] flex-col items-center justify-center gap-3 px-0.5 pt-2.5 pb-0.5 text-center'>
							<span className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700' aria-hidden='true'>
								<HugeiconsIcon icon={ShoppingCart02Icon} strokeWidth={1.5} className='size-6.5' />
							</span>
							<div className='flex flex-col gap-1.5'>
								<h3 className='text-base font-semibold tracking-tight'>No shopping history yet</h3>
								<p className='mx-auto max-w-[280px] text-sm leading-[1.55] text-slate-500'>
									Complete your first shopping session to start building your history.
								</p>
							</div>
						</div>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{groups.map((group: ComponentProps<typeof GroupCard>['group']) => (
							<GroupCard
								key={group.id}
								group={group}
								history={true}
							/>
						))}
					</div>
				)}
			</PageContainer>
		</>
	)
}
