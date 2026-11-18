'use client'

import { useMonthSpending } from './hooks/use-month-spending'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardEmptyState } from './dashboard-empty-state'
import { MonthSpendingSummary } from './month-spending-summary'
import { Invoice01Icon } from '@hugeicons/core-free-icons'

export function MonthSpendingSkeleton({ testId }: { testId: string }) {
	return (
		<div data-testid={testId} aria-hidden='true' className='flex flex-col gap-3.5'>
			<div className='flex items-center justify-between gap-3'>
				<Skeleton className='h-5 w-36' />
				<Skeleton className='h-3.5 w-16' />
			</div>
			<div className='relative mx-auto size-50'>
				<Skeleton className='size-full rounded-full' />
				<div className='absolute inset-8.5 rounded-full bg-card' />
			</div>
			<div className='flex flex-col gap-2'>
				{[0, 1, 2].map(row => (
					<div key={row} className='flex items-center gap-2'>
						<Skeleton className='size-2.5 rounded-sm' />
						<Skeleton className='h-3.5 min-w-0 flex-1' />
						<Skeleton className='h-3.5 w-8' />
						<Skeleton className='h-3.5 w-16' />
					</div>
				))}
			</div>
			<div className='flex gap-2'>
				<Skeleton className='h-19 flex-1 rounded-2xl' />
				<Skeleton className='h-19 flex-1 rounded-2xl' />
			</div>
			<div className='flex flex-col gap-2'>
				<Skeleton className='h-3 w-24' />
				{[0, 1].map(row => (
					<div key={row} className='grid grid-cols-[4.75rem_minmax(0,1fr)_2rem_5.25rem] items-center gap-2'>
						<Skeleton className='h-3.5 w-full' />
						<Skeleton className='h-2 w-full rounded-full' />
						<Skeleton className='h-3.5 w-full' />
						<Skeleton className='h-3.5 w-full' />
					</div>
				))}
			</div>
			<Skeleton className='h-3 w-3/4' />
		</div>
	)
}

export function MonthSpendingCard() {
	const spending = useMonthSpending()
	return (
		<Card
			data-testid='dashboard-month-spending-card'
			size='spending'
			className='mb-[-8px]'
		>
			{spending.status === 'loading' ? (
				<div
					data-testid='dashboard-month-spending-loading'
					role='status'
					aria-busy='true'
					aria-label='Loading monthly spending'
				>
					<MonthSpendingSkeleton testId='dashboard-month-spending-skeleton' />
				</div>
			) : null}
			{spending.status === 'error' ? (
				<div
					data-testid='dashboard-month-spending-error'
					role='alert'
					className='flex flex-col items-center justify-center gap-3 py-8 text-center'
				>
					<p className='text-sm text-muted-foreground'>We couldn’t load this month’s spending.</p>
					<Button
						type='button'
						variant='secondary'
						size='lg'
						onClick={spending.retry}
					>
						Try Again
					</Button>
				</div>
			) : null}
			{spending.status === 'ready'
				? (() => {
						const { summary } = spending
						const receiptCount = summary.receipt_count ?? summary.receipts_count ?? 0
						if (receiptCount === 0) {
							return (
								<DashboardEmptyState
									testId='dashboard-month-spending-empty'
									icon={Invoice01Icon}
									tone='ocr'
									title='No receipt spending recorded this month.'
									message='Upload a receipt to see your spending here.'
								/>
							)
						}
						return <MonthSpendingSummary summary={summary} receiptCount={receiptCount} />
					})()
				: null}
		</Card>
	)
}
