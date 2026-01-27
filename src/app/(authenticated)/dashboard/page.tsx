import { FolderLibraryIcon, Invoice01Icon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons'

import { DashboardCard, PageHeader, PageContainer, ActiveShopping } from '@/components/app'

import { getGroups } from '@/actions/ticket-groups'
import { getTickets } from '@/actions/tickets'
import { getActiveShoppingRun, getShoppingHistory } from '@/actions/shopping-runs'

export default async function DashboardPage() {
	const activeRunResult = await getActiveShoppingRun()
	const groupsResult = await getGroups()
	const historyResult = await getShoppingHistory()
	const ticketsResult = await getTickets()

	const activeRun = activeRunResult.data
	const groups = groupsResult.data || []
	const historyCount = historyResult.data?.length || 0
	const ticketsCount = ticketsResult.data?.length || 0

	console.log('Dashboard data:', { activeRun, groups, historyCount })

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
					<DashboardCard
						href='/tickets'
						icon={Invoice01Icon}
						title='Tickets'
						description='Upload and manage tickets'
						count={ticketsCount}
					/>

					<DashboardCard
						href='/ticket-groups'
						icon={FolderLibraryIcon}
						title='Ticket Groups'
						description='Manage your shopping list groups'
						count={groups.length}
					/>

					<DashboardCard
						href='/history'
						icon={TimeQuarterPassIcon}
						title='History'
						description='View past shoppings'
						count={historyCount}
					/>
				</div>
			</PageContainer>
		</>
	)
}
