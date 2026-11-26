import type { ComponentProps } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { Button } from '@/components/ui/button'
import { EmptyStateCard, RetryableError } from '@/components/commons'
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
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				entity='trip'
				title='Trips'
				desc='Every trip you have completed, newest first'
			/>

			<PageContainer>
				{loadFailed ? (
					<RetryableError
						message='We couldn’t load your trips.'
						href='/trips'
						testId='history-load-error'
					/>
				) : view.options.length === 0 && view.trips.length === 0 ? (
					<EmptyStateCard
						stub={{ label: 'Trips', count: '0 completed' }}
						ghost='trip'
						title='No trips yet'
						description='Your trips will appear here once you complete your first shopping session.'
						testId='history-empty-state'
					>
						<Button
							asChild
							variant='outline'
							size='xl'
						>
							<Link
								href='/shopping-lists'
								data-testid='history-empty-lists-link'
							>
								Go to Lists
							</Link>
						</Button>
					</EmptyStateCard>
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
									href={`/shopping/${session.id}?from=trips${view.selectedListId ? `&list=${view.selectedListId}` : ''}`}
								/>
							))}
						</div>
					</div>
				)}
			</PageContainer>
		</>
	)
}
