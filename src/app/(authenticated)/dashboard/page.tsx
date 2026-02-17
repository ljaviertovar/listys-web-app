import { Suspense } from 'react'
import { FolderLibraryIcon, Invoice01Icon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons'

import { DashboardCard, PageHeader, PageContainer, ActiveShopping } from '@/components/app'

import { getGroups } from '@/actions/shopping-lists'
import { getTickets } from '@/actions/tickets'
import { getActiveShoppingSession, getShoppingHistory } from '@/actions/shopping-sessions'

// Fallback skeleton for dashboard cards
function CardsSkeleton() {
	return (
		<div className='grid gap-6 md:grid-cols-3'>
			{Array.from({ length: 3 }).map((_, i) => (
				<div
					key={i}
					className='h-48 rounded-lg border bg-card animate-pulse'
				/>
			))}
		</div>
	)
}

// Fallback skeleton for active shopping section
function ActiveShoppingSkeleton() {
	return <div className='h-32 rounded-lg border bg-card animate-pulse' />
}

// Component to fetch and display cards
async function DashboardCards() {
	const [groupsResult, historyResult, ticketsResult] = await Promise.all([
		getGroups(),
		getShoppingHistory(),
		getTickets(),
	])

	const groups = groupsResult.data || []
	const historyCount = historyResult.data?.length || 0
	const ticketsCount = ticketsResult.data?.length || 0

	return (
		<div className='grid gap-6 md:grid-cols-3'>
			<DashboardCard
				href='/shopping-lists'
				icon={FolderLibraryIcon}
				title='Shopping Lists Groups'
				description='Manage your shopping list groups and their lists.'
				count={groups.length}
			/>

			<DashboardCard
				href='/tickets'
				icon={Invoice01Icon}
				title='Receipts'
				description='Upload and manage receipts. Create shopping lists from them.'
				count={ticketsCount}
			/>

			<DashboardCard
				href='/shopping-history'
				icon={TimeQuarterPassIcon}
				title='Shopping History'
				description='View past shopping sessions and their details.'
				count={historyCount}
			/>
		</div>
	)
}

// Component to fetch and display active shopping
async function ActiveShoppingSection() {
	const activeSessionResult = await getActiveShoppingSession()
	const activeSession = activeSessionResult.data

	if (!activeSession) return null

	return (
		<ActiveShopping
			activeShopping={activeSession}
			dashboard
		/>
	)
}

export default async function DashboardPage() {
	return (
		<>
			<PageHeader
				title='Dashboard'
				desc='Overview of your shopping activity'
			/>
			<PageContainer>
				{/* Active Shopping Session with Suspense */}
				<Suspense fallback={<ActiveShoppingSkeleton />}>
					<ActiveShoppingSection />
				</Suspense>

				{/* Quick Actions with Suspense */}
				<Suspense fallback={<CardsSkeleton />}>
					<DashboardCards />
				</Suspense>
			</PageContainer>
		</>
	)
}
