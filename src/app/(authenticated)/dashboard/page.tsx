import { FolderLibraryIcon, Invoice01Icon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons'

import { DashboardCard, PageHeader, PageContainer, ActiveShopping } from '@/components/app'

import { getGroups } from '@/actions/shopping-lists'
import { getTickets } from '@/actions/tickets'
import { getActiveShoppingSession, getShoppingHistory } from '@/actions/shopping-sessions'

export default async function DashboardPage() {
	const activeSessionResult = await getActiveShoppingSession()
	const groupsResult = await getGroups()
	const historyResult = await getShoppingHistory()
	const ticketsResult = await getTickets()

	const activeSession = activeSessionResult.data
	const groups = groupsResult.data || []
	const historyCount = historyResult.data?.length || 0
	const ticketsCount = ticketsResult.data?.length || 0

	return (
		<>
			<PageHeader
				title='Dashboard'
				desc='Overview of your shopping activity'
			/>
			<PageContainer>
				{/* Active Shopping Session */}
				{activeSession && (
					<ActiveShopping
						activeShopping={activeSession}
						dashboard
					/>
				)}

				{/* Quick Actions */}
				<div className='grid gap-6 md:grid-cols-3'>
					<DashboardCard
						href='/shopping-lists'
						icon={FolderLibraryIcon}
						title='Shopping Lists'
						description='Manage your shopping list groups'
						count={groups.length}
					/>

					<DashboardCard
						href='/tickets'
						icon={Invoice01Icon}
						title='Receipts'
						description='Upload and manage receipts'
						count={ticketsCount}
					/>

					<DashboardCard
						href='/shopping-history'
						icon={TimeQuarterPassIcon}
						title='Shopping History'
						description='View past shopping sessions'
						count={historyCount}
					/>
				</div>
			</PageContainer>
		</>
	)
}
