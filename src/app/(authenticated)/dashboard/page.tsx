import { createClient } from '@/lib/supabase/server'
import { getActiveShoppingRun, getShoppingHistory } from '@/actions/shopping-runs'
import { getGroups } from '@/actions/groups'
import Link from 'next/link'

export default async function DashboardPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

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
		<div className='min-h-screen bg-gray-50'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
						<p className='text-gray-600 mt-1'>{user?.email}</p>
					</div>
					<form action={handleSignOut}>
						<button
							type='submit'
							className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50'
						>
							Sign Out
						</button>
					</form>
				</div>

				{/* Active Shopping Run */}
				{activeRun && (
					<div className='mb-8 rounded-lg border-2 border-green-500 bg-green-50 p-6'>
						<div className='flex items-center justify-between'>
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
						href='/groups'
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
		</div>
	)
}
