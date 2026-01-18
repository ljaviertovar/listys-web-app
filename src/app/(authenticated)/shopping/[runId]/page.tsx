import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getShoppingRun } from '@/actions/shopping-runs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { ShoppingRunItemRow } from '@/components/features/shopping-runs/shopping-run-item-row'
import { CompleteRunButton } from '@/components/features/shopping-runs/complete-run-button'
import { CompleteRunAlert } from '@/components/features/shopping-runs/complete-run-alert'
import { AddItemDialog } from '@/components/features/shopping-runs/add-item-dialog'
import { CancelRunButton } from '@/components/features/shopping-runs/cancel-run-button'
import type { ShoppingRunWithItems } from '@/features/shopping-runs/types'
import PageHeader from '@/components/app/page-header'

export default async function ShoppingRunPage({ params }: { params: Promise<{ runId: string }> }) {
	const { runId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: shoppingRun, error } = await getShoppingRun(runId)

	if (error || !shoppingRun) {
		redirect('/dashboard')
	}

	const runWithItems = shoppingRun as ShoppingRunWithItems

	// Sort items: unchecked first, then by category and sort_order
	const sortedItems = [...runWithItems.items].sort((a, b) => {
		if (a.checked !== b.checked) return a.checked ? 1 : -1
		if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '')
		return (a.sort_order || 0) - (b.sort_order || 0)
	})

	const checkedCount = runWithItems.items.filter(item => item.checked).length
	const totalCount = runWithItems.items.length
	const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title={runWithItems.name}
				desc={`${checkedCount} of ${totalCount} items (${progress}%)`}
			/>
			<div className='container mx-auto max-w-4xl space-y-6 p-6'>
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

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							<span className='flex items-center gap-2'>
								<HugeiconsIcon
									icon={ShoppingCart02Icon}
									strokeWidth={2}
								/>
								Shopping List
							</span>
							{runWithItems.status !== 'completed' && (
								<div className='flex items-center gap-2'>
									<CancelRunButton runId={runId} />
									<CompleteRunButton runId={runId} />
								</div>
							)}
						</CardTitle>
						<CardDescription>Check off items as you shop</CardDescription>
					</CardHeader>
					<CardContent>
						{sortedItems.length === 0 ? (
							<div className='py-8 text-center text-sm text-muted-foreground'>No items in this shopping run</div>
						) : (
							<div className='space-y-1'>
								{sortedItems.map(item => (
									<ShoppingRunItemRow
										key={item.id}
										item={item}
										isCompleted={runWithItems.status === 'completed'}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{runWithItems.status !== 'completed' && (
					<>
						<AddItemDialog runId={runId} />
						<CompleteRunAlert
							runId={runId}
							progress={progress}
						/>
					</>
				)}
			</div>
		</main>
	)
}
