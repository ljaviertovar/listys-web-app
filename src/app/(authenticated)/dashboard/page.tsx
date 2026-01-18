import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import { getActiveShoppingRun, getShoppingHistory } from '@/actions/shopping-runs'
import { getGroups } from '@/actions/ticket-groups'
import PageHeader from '@/components/app/page-header'

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
					<div className='mb-8 rounded-lg border-2 border-green-500 bg-green-50 p-6'>
						<div className='flex items-center justify-between mb-3'>
							<div>
								<h2 className='text-lg font-semibold text-green-900'>Active Shopping Run</h2>
								<p className='text-sm text-green-700 mt-1'>{activeRun.name}</p>
							</div>
							<Link
								href={`/shopping/${activeRun.id}`}
								className='rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700'
							>
								Continue Shopping
							</Link>
						</div>
						<div className='rounded-md bg-green-100 border border-green-200 p-3'>
							<p className='text-xs text-green-800'>
								💡 <strong>Note:</strong> You can only have one active shopping run at a time. Complete or cancel this
								run before starting a new one.
							</p>
						</div>
					</div>
				)}

				{/* Quick Actions */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<Link
						href='/tickets'
						className='rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow'
					>
						<div className='text-3xl mb-3'>📸</div> <h3 className='text-lg font-semibold text-gray-900'>Tickets</h3>
						<p className='text-sm text-gray-600 mt-2'>Upload and manage receipts</p>
					</Link>

					<Link
						href='/ticket-groups'
						className='rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow'
					>
						<div className='text-3xl mb-3'>📋</div>
						<h3 className='text-lg font-semibold text-gray-900'>My Groups</h3>
						<p className='text-sm text-gray-600 mt-2'>Manage your shopping list groups</p>
						<p className='text-2xl font-bold text-primary mt-4'>{groups.length}</p>
					</Link>

					<Link
						href='/history'
						className='rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow'
					>
						<div className='text-3xl mb-3'>📊</div>
						<h3 className='text-lg font-semibold text-gray-900'>History</h3>
						<p className='text-sm text-gray-600 mt-2'>View past shopping runs</p>
						<p className='text-2xl font-bold text-primary mt-4'>{historyCount}</p>{' '}
					</Link>
				</div>
			</div>
		</main>
	)
}
