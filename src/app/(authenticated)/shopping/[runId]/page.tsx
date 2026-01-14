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
import type { ShoppingRunWithItems } from '@/features/shopping-runs/types'

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
				<h1 className='text-3xl font-bold'>{runWithItems.name}</h1>
				<p className='text-muted-foreground'>
					{checkedCount} of {totalCount} items ({progress}%)
				</p>
			</div>

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
						<CompleteRunButton runId={runId} />
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
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AddItemDialog runId={runId} />

			<CompleteRunAlert
				runId={runId}
				progress={progress}
			/>
		</div>
	)
}
