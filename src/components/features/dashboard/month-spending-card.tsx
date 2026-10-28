'use client'

import { useMonthSpending } from './hooks/use-month-spending'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

export function MonthSpendingCard() {
	const spending = useMonthSpending()
	return (
		<DashboardSectionCard testId='dashboard-month-spending-card' title='This Month' viewAll={{ href: '/shopping-history', noun: 'history', testId: 'dashboard-month-spending-view-all' }}>
			{spending.status === 'loading' ? (
				<div data-testid='dashboard-month-spending-loading' aria-label='Loading monthly spending' className='flex flex-1 flex-col justify-center gap-3 px-3 py-6'>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='h-4 w-48' />
				</div>
			) : null}
			{spending.status === 'error' ? (
				<div data-testid='dashboard-month-spending-error' role='alert' className='flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center'>
					<p className='text-sm text-muted-foreground'>We couldn’t load this month’s spending.</p>
					<Button type='button' variant='secondary' size='sm' onClick={spending.retry}>Try Again</Button>
				</div>
			) : null}
			{spending.status === 'ready' ? (() => {
				const { summary } = spending
				const knownTotals = summary.trips_count + summary.receipts_count
				if (knownTotals === 0) {
					return <DashboardEmptyState testId='dashboard-month-spending-empty' icon={ShoppingCart02Icon} tone='success' title='No spending recorded this month.' message='Add a total when you complete a trip or from a receipt.' action={summary.trips_without_total > 0 ? <MissingTotals count={summary.trips_without_total} /> : undefined} />
				}
				return (
					<div data-testid='dashboard-month-spending-summary' className='flex flex-1 flex-col justify-center gap-2 px-4 py-5'>
						<div className='flex items-center gap-3'>
							<RowIcon icon={ShoppingCart02Icon} tone='success' size='md' />
							<p className='font-mono text-2xl font-semibold tabular-nums'>{formatCurrency(summary.total)}</p>
						</div>
						<p className='pl-12 text-sm text-muted-foreground'>From {summary.trips_count} {summary.trips_count === 1 ? 'trip' : 'trips'} and {summary.receipts_count} {summary.receipts_count === 1 ? 'receipt' : 'receipts'}</p>
						{summary.trips_without_total > 0 ? <p data-testid='dashboard-month-spending-missing-totals' className='pl-12 text-sm text-amber-700 dark:text-amber-400'><MissingTotals count={summary.trips_without_total} /></p> : null}
					</div>
				)
			})() : null}
		</DashboardSectionCard>
	)
}

function MissingTotals({ count }: { count: number }) {
	return <>{count} {count === 1 ? 'trip' : 'trips'} this month {count === 1 ? 'has' : 'have'} no total</>
}
