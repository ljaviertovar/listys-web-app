import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGroups } from '@/actions/groups'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, FolderIcon, ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { CreateGroupDialog } from '@/components/features/groups/create-group-dialog'

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
		<div className='container mx-auto max-w-7xl space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Link
						href='/dashboard'
						className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
					>
						<HugeiconsIcon
							icon={ArrowLeft02Icon}
							strokeWidth={2}
							className='h-4 w-4'
						/>
						Back to Dashboard
					</Link>
					<h1 className='text-3xl font-bold'>Groups</h1>
					<p className='text-muted-foreground'>Organize your shopping lists into groups</p>
				</div>
				<CreateGroupDialog />
			</div>

			{error && (
				<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading groups: {error}</div>
			)}

			{!groups || groups.length === 0 ? (
				<Card className='flex min-h-[400px] flex-col items-center justify-center'>
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
						<Link
							key={group.id}
							href={`/groups/${group.id}/lists`}
						>
							<Card className='transition-colors hover:bg-muted/50'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<HugeiconsIcon
											icon={FolderIcon}
											strokeWidth={2}
										/>
										{group.name}
									</CardTitle>
									{group.description && <CardDescription>{group.description}</CardDescription>}
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
