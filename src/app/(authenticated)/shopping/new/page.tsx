import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBaseList } from '@/actions/base-lists'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { CreateShoppingRunForm } from '@/components/features/shopping-runs/create-shopping-run-form'
import PageHeader from '@/components/app/page-header'

export default async function NewShoppingRunPage({ searchParams }: { searchParams: Promise<{ baseListId?: string }> }) {
	const { baseListId } = await searchParams
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	if (!baseListId) {
		redirect('/ticket-groups')
	}

	const { data: baseList, error } = await getBaseList(baseListId)

	if (error || !baseList) {
		redirect('/ticket-groups')
	}

	// Check if there's already an active shopping run
	const { data: activeRun, error: runError } = await supabase
		.from('shopping_runs')
		.select('id')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.single()

	// If there's an active run, redirect to it
	if (activeRun && !runError) {
		redirect(`/shopping/${activeRun.id}`)
	}

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title='Start Shopping Run'
				desc={`Create a new shopping run from "${baseList.name}"`}
			/>
			<div className='container mx-auto max-w-2xl space-y-6 p-6'>
				<Link
					href={`/ticket-groups/${baseList.group_id}/lists`}
					className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Back to Lists
				</Link>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
							/>
							New Shopping Run
						</CardTitle>
						<CardDescription>This will copy all items from your base list to a new active shopping run</CardDescription>
					</CardHeader>
					<CardContent>
						<CreateShoppingRunForm
							baseListId={baseListId}
							defaultName={baseList.name}
						/>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
