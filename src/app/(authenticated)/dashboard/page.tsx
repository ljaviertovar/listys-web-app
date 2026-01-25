import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HugeiconsIcon } from '@hugeicons/react'
import { Camera01Icon, FolderLibraryIcon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons'

import { getActiveShoppingRun, getShoppingHistory } from '@/actions/shopping-runs'
import { getGroups } from '@/actions/ticket-groups'
import PageHeader from '@/components/app/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	const activeRunResult = await getActiveShoppingRun()
	const groupsResult = await getGroups()
	const historyResult = await getShoppingHistory()

	const activeRun = activeRunResult.data
	const groups = groupsResult.data || []
	const historyCount = historyResult.data?.length || 0

	const handleSignOut = async () => {
		'use server'
		const supabase = await createClient()
		await supabase.auth.signOut()
	}

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title='Dashboard'
				desc='Overview of your shopping activity'
			/>
			<div className='container mx-auto max-w-7xl space-y-6 p-6'>
				{/* Active Shopping Run */}
				{activeRun && (
					<Card className='border-primary/50 bg-primary/5'>
						<CardHeader>
							<CardTitle className='text-primary'>Active Shopping Run</CardTitle>
							<CardDescription>{activeRun.name}</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							<div className='rounded-lg border border-primary/20 bg-background p-3'>
								<p className='text-xs text-muted-foreground'>
									<strong>Note:</strong> You can only have one active shopping run at a time. Complete or cancel this
									run before starting a new one.
								</p>
							</div>
							<Button
								asChild
								className='w-full'
							>
								<Link href={`/shopping/${activeRun.id}`}>Continue Shopping</Link>
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Quick Actions */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<Card className='hover:border-primary/50 transition-colors cursor-pointer'>
						<Link href='/tickets'>
							<CardHeader>
								<HugeiconsIcon
									icon={Camera01Icon}
									strokeWidth={1.5}
									className='h-12 w-12 text-muted-foreground mb-2'
								/>
								<CardTitle>Tickets</CardTitle>
								<CardDescription>Upload and manage receipts</CardDescription>
							</CardHeader>
						</Link>
					</Card>

					<Card className='hover:border-primary/50 transition-colors cursor-pointer'>
						<Link href='/ticket-groups'>
							<CardHeader>
								<HugeiconsIcon
									icon={FolderLibraryIcon}
									strokeWidth={1.5}
									className='h-12 w-12 text-muted-foreground mb-2'
								/>
								<CardTitle>My Groups</CardTitle>
								<CardDescription>Manage your shopping list groups</CardDescription>
								<p className='text-2xl font-bold text-primary mt-2'>{groups.length}</p>
							</CardHeader>
						</Link>
					</Card>

					<Card className='hover:border-primary/50 transition-colors cursor-pointer'>
						<Link href='/history'>
							<CardHeader>
								<HugeiconsIcon
									icon={TimeQuarterPassIcon}
									strokeWidth={1.5}
									className='h-12 w-12 text-muted-foreground mb-2'
								/>
								<CardTitle>History</CardTitle>
								<CardDescription>View past shopping runs</CardDescription>
								<p className='text-2xl font-bold text-primary mt-2'>{historyCount}</p>
							</CardHeader>
						</Link>
					</Card>
				</div>
			</div>
		</main>
	)
}
