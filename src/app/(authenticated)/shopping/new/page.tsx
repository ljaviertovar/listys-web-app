import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBaseList } from '@/actions/base-lists'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { CreateShoppingRunForm } from '@/components/features/shopping-runs/create-shopping-run-form'

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
		redirect('/groups')
	}

	const { data: baseList, error } = await getBaseList(baseListId)

	if (error || !baseList) {
		redirect('/groups')
	}

	return (
		<div className='container mx-auto max-w-2xl space-y-6 p-6'>
			<div>
				<Link
					href={`/groups/${baseList.group_id}/lists`}
					className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Back to Lists
				</Link>
				<h1 className='text-3xl font-bold'>Start Shopping Run</h1>
				<p className='text-muted-foreground'>Create a new shopping run from "{baseList.name}"</p>
			</div>

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
	)
}
