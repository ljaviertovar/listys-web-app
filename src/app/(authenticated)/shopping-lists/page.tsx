import { redirect } from 'next/navigation'
import { FolderSearch2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { CreateGroupDialog, GroupCard } from '@/components/features/shopping-lists'
import { PageHeader, PageContainer, PageFooterAction, BackLink } from '@/components/app'

import { createClient } from '@/lib/supabase/server'

import { getGroups } from '@/actions/shopping-lists'

export default async function GroupsPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: groups, error } = await getGroups()

	return (
		<>
			<PageHeader
				title='Shopping List Groups'
				desc='Organize your shopping lists into groups or stores. Eg: Groceries, Electronics, Walmart, etc.'
			>
				{groups && groups.length > 0 && (
					<div className='justify-end hidden md:flex'>
						<div className='w-fit'>
							<CreateGroupDialog />
						</div>
					</div>
				)}
			</PageHeader>

			<PageContainer>
				<div className='w-full mb-2'>
					<BackLink
						href='/dashboard'
						label='Back to Dashboard'
					/>
				</div>

				{!groups || groups.length === 0 ? (
					<Card
						className='flex min-h-100 flex-col items-center justify-center'
						size='compact'
						variant='premium'
					>
						<CardContent className='flex w-full max-w-md flex-col items-center pt-6 text-center'>
							<div className='flex h-16 w-16 items-center justify-center text-primary'>
								<FolderSearch2 className='h-12 w-12' />
							</div>
							<div className='mt-1'>
								<h3 className='text-xl font-semibold tracking-tight'>No groups yet</h3>
								<p className='mt-1 text-sm text-muted-foreground'>
									Create your first group to organize your shopping lists faster.
								</p>
							</div>
							<div className='mt-6 w-full max-w-[260px]'>
								<CreateGroupDialog />
							</div>
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{groups.map((group: any) => (
							<GroupCard
								key={group.id}
								group={group}
							/>
						))}
					</div>
				)}
			</PageContainer>

			{groups && groups.length > 0 && (
				<PageFooterAction>
					<div className='w-full md:hidden'>
						<CreateGroupDialog />
					</div>
				</PageFooterAction>
			)}
		</>
	)
}
