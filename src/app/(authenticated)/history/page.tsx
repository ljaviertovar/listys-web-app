import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGroups } from '@/actions/ticket-groups'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ShoppingBasket01Icon, FolderIcon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import PageHeader from '@/components/app/page-header'
import PageContainer from '@/components/app/page-container'

export default async function HistoryPage() {
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
				title='Shopping History'
				desc='View your past shopping runs by group'
			/>
			<PageContainer>
				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading groups: {error}</div>
				)}

				{!groups || groups.length === 0 ? (
					<Card className='flex min-h-[400px] flex-col items-center justify-center'>
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
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{groups.map(group => (
							<Link
								key={group.id}
								href={`/history/${group.id}`}
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
			</PageContainer>
		</>
	)
}
