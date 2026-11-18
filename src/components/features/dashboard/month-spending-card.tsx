'use client'

import { useState } from 'react'

import { useSpendingSummary, type SpendingScope } from './hooks/use-spending-summary'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardEmptyState } from './dashboard-empty-state'
import { formatFirstReceipt, formatLastReceipt } from './helpers/format-first-receipt'
import { MonthSpendingSummary } from './month-spending-summary'
import { SpendingScopeSelect } from './spending-scope-select'
import { Invoice01Icon } from '@hugeicons/core-free-icons'
import { UploadTicketDialog } from '@/components/features/tickets'

/** "November": the month the card is on, for the sentence that says nothing was recorded in it. */
function getMonthName(date: string) {
	const month = new Date(`${date.slice(0, 10)}T00:00:00Z`)
	return Number.isNaN(month.getTime())
		? null
		: new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(month)
}

function getMonthLabel(date: string) {
	const month = new Date(`${date.slice(0, 10)}T00:00:00Z`)
	return Number.isNaN(month.getTime())
		? null
		: new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(month)
}

/** `header` is off when the card draws its own title row (the scope choice) above the skeleton. */
export function MonthSpendingSkeleton({ testId, header = true }: { testId: string; header?: boolean }) {
	return (
		<div
			data-testid={testId}
			aria-hidden='true'
			className='flex flex-col gap-3.5'
		>
			{header ? (
				<div className='flex items-center justify-between gap-3'>
					<Skeleton className='h-5 w-36' />
					<Skeleton className='h-3.5 w-16' />
				</div>
			) : null}
			<div className='relative mx-auto size-50'>
				<Skeleton className='size-full rounded-full' />
				<div className='absolute inset-8.5 rounded-full bg-card' />
			</div>
			<div className='flex flex-col gap-2'>
				{[0, 1, 2].map(row => (
					<div
						key={row}
						className='flex items-center gap-2'
					>
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
					<div
						key={row}
						className='grid grid-cols-[6.25rem_minmax(0,1fr)_2rem_5.25rem] items-center gap-2'
					>
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
	const [scope, setScope] = useState<SpendingScope>('month')
	const spending = useSpendingSummary(scope)
	// The month names the range the card is on; all time says since when the receipts go.
	const periodLabel =
		spending.status === 'ready'
			? scope === 'month'
				? getMonthLabel(spending.summary.from)
				: formatFirstReceipt(spending.summary.first_receipt_at)
					? `since ${formatFirstReceipt(spending.summary.first_receipt_at)}`
					: null
			: null

	return (
		<Card
			data-testid='dashboard-month-spending-card'
			size='spending'
			className='-mb-2'
		>
			<div className='flex flex-col gap-3.5'>
				<div className='flex items-center justify-between gap-3'>
					<SpendingScopeSelect
						value={scope}
						onChange={setScope}
						testId='dashboard-month-spending-scope'
					/>
					{spending.status === 'loading' ? (
						<Skeleton
							aria-hidden='true'
							className='h-3.5 w-16'
						/>
					) : periodLabel ? (
						<span
							data-testid='dashboard-month-spending-period'
							className='shrink-0 font-mono text-xs text-muted-foreground'
						>
							{periodLabel}
						</span>
					) : null}
				</div>
				{spending.status === 'loading' ? (
					<div
						data-testid='dashboard-month-spending-loading'
						role='status'
						aria-busy='true'
						aria-label='Loading spending'
					>
						<MonthSpendingSkeleton
							testId='dashboard-month-spending-skeleton'
							header={false}
						/>
					</div>
				) : null}
				{spending.status === 'error' ? (
					<div
						data-testid='dashboard-month-spending-error'
						role='alert'
						className='flex flex-col items-center justify-center gap-3 py-8 text-center'
					>
						<p className='text-sm text-muted-foreground'>We couldn’t load your spending.</p>
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
								const lastReceipt = scope === 'month' ? formatLastReceipt(summary.last_receipt_at) : null
								const monthName = getMonthName(summary.from)
								// A month with nothing in an account that has receipts is not an empty account: say so, and offer the rest.
								if (lastReceipt && monthName) {
									return (
										<DashboardEmptyState
											testId='dashboard-month-spending-empty'
											icon={Invoice01Icon}
											tone='primary'
											variant='info'
											title={`No receipts in ${monthName} yet`}
											message={`Your last receipt was on ${lastReceipt}.`}
											action={
												<Button
													type='button'
													variant='outline'
													size='default'
													data-testid='dashboard-month-spending-see-all'
													onClick={() => setScope('all')}
												>
													See All Time
												</Button>
											}
										/>
									)
								}
								return (
									<DashboardEmptyState
										testId='dashboard-month-spending-empty'
										icon={Invoice01Icon}
										tone='primary'
										variant='info'
										title={
											scope === 'month'
												? 'No receipt spending recorded this month.'
												: 'No receipt spending recorded yet.'
										}
										message='Upload a receipt to see your spending here.'
										action={
											<UploadTicketDialog
												trigger={
													<Button
														type='button'
														size='default'
														variant='outline'
													>
														Upload Receipt
													</Button>
												}
											/>
										}
									/>
								)
							}
							return (
								<MonthSpendingSummary
									summary={summary}
									receiptCount={receiptCount}
								/>
							)
						})()
					: null}
			</div>
		</Card>
	)
}
