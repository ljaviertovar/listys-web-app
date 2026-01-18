import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getShoppingHistory } from '@/actions/shopping-runs'
import { getGroup } from '@/actions/ticket-groups'
import { Card, CardContent } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { HistoryRunCard } from '@/components/features/shopping-runs/history-run-card'
import PageHeader from '@/components/app/page-header'

export default async function GroupHistoryPage({ params }: { params: Promise<{ groupId: string }> }) {
	const { groupId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: group, error: groupError } = await getGroup(groupId)
	const { data: allRuns, error: runsError } = await getShoppingHistory()

	if (groupError || !group) {
		redirect('/history')
	}

	// Filter runs for this specific group
	const runs = allRuns?.filter(run => run.base_list?.group?.id === groupId) || []

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title={group.name}
				desc={group.description || 'Shopping history for this group'}
			/>
			<div className='container mx-auto max-w-4xl space-y-6 p-6'>
				<Link
					href='/history'
					className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Back to History
				</Link>

				{runsError && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
						Error loading history: {runsError}
					</div>
				)}

				{runs.length === 0 ? (
					<Card className='flex min-h-[400px] flex-col items-center justify-center'>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={ShoppingBasket01Icon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No shopping history yet</h3>
								<p className='text-sm text-muted-foreground'>
									Complete shopping runs from this group's lists to see them here
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4'>
						{runs.map(run => (
							<HistoryRunCard
								key={run.id}
								run={run}
							/>
						))}
					</div>
				)}
			</div>
		</main>
	)
}
