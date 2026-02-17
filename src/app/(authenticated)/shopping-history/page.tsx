import { redirect } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'

import { PageHeader, PageContainer } from '@/components/app'
import { GroupCard } from '@/components/features/shopping-lists'

import { getGroupsWithHistory } from '@/actions/shopping-lists'
import { createClient } from '@/lib/supabase/server'
import { FolderSearch2 } from 'lucide-react'

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
						<CardContent className='flex w-full max-w-md flex-col items-center pt-6 text-center'>
							<div className='flex h-16 w-16 items-center justify-center text-primary'>
								<FolderSearch2 className='h-12 w-12' />
							</div>
							<div className='mt-1'>
								<h3 className='text-xl font-semibold tracking-tight'>No shopping history yet</h3>
								<p className='mt-2 text-sm text-muted-foreground'>
									Complete your first shopping session to start building your history.
								</p>
							</div>
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
