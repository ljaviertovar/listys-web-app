import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getShoppingHistory } from '@/actions/shopping-runs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { HistoryRunCard } from '@/components/features/shopping-runs/history-run-card'

export default async function HistoryPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: runs, error } = await getShoppingHistory()

	return (
		<div className='container mx-auto max-w-4xl space-y-6 p-6'>
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
				<h1 className='text-3xl font-bold'>Shopping History</h1>
				<p className='text-muted-foreground'>View your past shopping runs</p>
			</div>

			{error && (
				<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading history: {error}</div>
			)}

			{!runs || runs.length === 0 ? (
				<Card className='flex min-h-[400px] flex-col items-center justify-center'>
					<CardContent className='flex flex-col items-center space-y-4 pt-6'>
						<HugeiconsIcon
							icon={ShoppingBasket01Icon}
							strokeWidth={1.5}
							className='h-16 w-16 text-muted-foreground'
						/>
						<div className='text-center'>
							<h3 className='text-lg font-semibold'>No shopping history yet</h3>
							<p className='text-sm text-muted-foreground'>Complete your first shopping run to see it here</p>
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
	)
}
