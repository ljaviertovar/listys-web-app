import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGroups } from '@/actions/ticket-groups'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, FolderIcon, ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { CreateGroupDialog } from '@/components/features/ticket-groups/create-group-dialog'
import { GroupCard } from '@/components/features/ticket-groups/group-card'
import PageHeader from '@/components/app/page-header'
import PageContainer from '@/components/app/page-container'

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
				title='Ticket Groups'
				desc='Organize your shopping lists into groups'
			>
				<CreateGroupDialog />
			</PageHeader>
			<PageContainer>
				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading groups: {error}</div>
				)}

				{!groups || groups.length === 0 ? (
					<Card className='flex min-h-100 flex-col items-center justify-center'>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={FolderIcon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No groups yet</h3>
								<p className='text-sm text-muted-foreground'>Create your first group to get started</p>
							</div>
							<CreateGroupDialog />
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{groups.map(group => (
							<GroupCard
								key={group.id}
								group={group}
							/>
						))}
					</div>
				)}
			</PageContainer>
		</>
	)
}
