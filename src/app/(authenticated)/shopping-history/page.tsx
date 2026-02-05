import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent } from '@/components/ui/card'

import PageHeader from '@/components/app/page-header'
import PageContainer from '@/components/app/page-container'
import { ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import { CreateGroupDialog } from '@/components/features/shopping-lists/create-group-dialog'
import { GroupCard } from '@/components/features/shopping-lists/group-card'

import { getGroupsWithHistory } from '@/actions/shopping-lists'
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
				title='Shopping History'
				desc='View your past shopping sessions by group'
			/>

			<PageContainer>
				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading groups: {error}</div>
				)}

				{!groups || groups.length === 0 ? (
					<Card
						className='flex min-h-100 flex-col items-center justify-center'
						size='sm'
					>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={ShoppingBasket01Icon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No groups yet</h3>
								<p className='text-sm text-muted-foreground'>Create groups and complete shopping runs to see history</p>
							</div>
							<CreateGroupDialog />
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{groups.map((group: any) => (
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
