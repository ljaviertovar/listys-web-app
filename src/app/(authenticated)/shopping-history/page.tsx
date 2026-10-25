import type { ComponentProps } from 'react'
import { redirect } from 'next/navigation'

import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'

import { PageHeader, PageContainer } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { HistoryListFilter, HistorySessionCard, buildHistoryView } from '@/components/features/shopping-sessions'

import { getBaseLists, getShoppingHistory } from '@/lib/api/endpoints'
import { createClient } from '@/lib/supabase/server'

type HistorySession = ComponentProps<typeof HistorySessionCard>['session'] & { base_list_id: string | null }

type SearchParams = { list?: string | string[] }

export default async function HistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const { list } = await searchParams
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const [historyResult, listsResult] = await Promise.all([getShoppingHistory(), getBaseLists()])
	const loadFailed = Boolean(historyResult.error || listsResult.error)

	const view = buildHistoryView({
		trips: (historyResult.data ?? []) as HistorySession[],
		lists: listsResult.data ?? [],
		listParam: Array.isArray(list) ? list[0] : list,
	})

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Shopping History'
				desc='Every trip you have completed, newest first'
			/>

			<PageContainer>
				{loadFailed ? (
					<RetryableError
						message='We couldn’t load your shopping history.'
						href='/shopping-history'
						testId='history-load-error'
					/>
				) : view.options.length === 0 && view.trips.length === 0 ? (
					<Card size='tight'>
						<div className='flex min-h-[152px] flex-col items-center justify-center gap-3 text-center'>
							<span
								className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700'
								aria-hidden='true'
							>
								<HugeiconsIcon
									icon={ShoppingCart02Icon}
									strokeWidth={1.5}
									className='size-6.5'
								/>
							</span>
							<div className='flex flex-col gap-1.5'>
								<h3 className='text-base font-semibold tracking-tight'>No shopping history yet</h3>
								<p className='mx-auto max-w-[280px] text-sm leading-[1.55] text-slate-500'>
									Complete your first shopping session to start building your history.
								</p>
							</div>
						</div>
					</Card>
				) : (
					<div className='flex flex-col gap-4'>
						<HistoryListFilter
							options={view.options}
							selectedListId={view.selectedListId}
						/>
						<div
							data-testid='history-trips'
							className='grid gap-4'
						>
							{view.trips.map(session => (
								<HistorySessionCard
									key={session.id}
									session={session}
									href={`/shopping/${session.id}?from=history${view.selectedListId ? `&list=${view.selectedListId}` : ''}`}
								/>
							))}
						</div>
					</div>
				)}
			</PageContainer>
		</>
	)
}
