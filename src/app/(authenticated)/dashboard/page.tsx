import Link from 'next/link'

import { HugeiconsIcon } from '@hugeicons/react'
import { Camera01Icon, FolderLibraryIcon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons'

import { getActiveShoppingRun, getShoppingHistory } from '@/actions/shopping-runs'
import { getGroups } from '@/actions/ticket-groups'
import PageHeader from '@/components/app/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/app'
import ActiveShopping from '@/components/app/active-shopping'

export default async function DashboardPage() {
	const activeRunResult = await getActiveShoppingRun()
	const groupsResult = await getGroups()
	const historyResult = await getShoppingHistory()

	const activeRun = activeRunResult.data
	const groups = groupsResult.data || []
	const historyCount = historyResult.data?.length || 0

	return (
		<>
			<PageHeader
				title='Dashboard'
				desc='Overview of your shopping activity'
			/>
			<PageContainer>
				{/* Active Shopping Run */}
				{activeRun && (
					<ActiveShopping
						activeShopping={activeRun}
						dashboard
					/>
				)}

				{/* Quick Actions */}
				<div className='grid gap-6 md:grid-cols-3'>
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
			</PageContainer>
		</>
	)
}
