'use client'

import { useMonthSpending } from './hooks/use-month-spending'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { Invoice01Icon } from '@hugeicons/core-free-icons'

const CATEGORY_BAR_COLORS: Record<string, string> = {
	Dairy: 'bg-sky-700 dark:bg-sky-400',
	Produce: 'bg-green-700 dark:bg-green-400',
	Bakery: 'bg-orange-700 dark:bg-orange-400',
	'Bakery Commercial': 'bg-orange-700 dark:bg-orange-400',
	Meat: 'bg-red-700 dark:bg-red-400',
	Meats: 'bg-red-700 dark:bg-red-400',
	Pantry: 'bg-violet-700 dark:bg-violet-400',
	Frozen: 'bg-teal-700 dark:bg-teal-400',
	'Frozen Food': 'bg-teal-700 dark:bg-teal-400',
	Beverages: 'bg-sky-700 dark:bg-sky-400',
	Seafood: 'bg-blue-700 dark:bg-blue-400',
	Snacks: 'bg-amber-700 dark:bg-amber-400',
	Household: 'bg-indigo-700 dark:bg-indigo-400',
}

function getMonthLabel(date: string) {
	return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`))
}

function getPreviousMonthLabel(date: string) {
	const previous = new Date(`${date.slice(0, 10)}T00:00:00Z`)
	previous.setUTCMonth(previous.getUTCMonth() - 1)
	return new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(previous)
}

function getPreviousMonthFullLabel(date: string) {
	const previous = new Date(`${date.slice(0, 10)}T00:00:00Z`)
	previous.setUTCMonth(previous.getUTCMonth() - 1)
	return new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(previous)
}

function getCategoryBarColor(name: string) {
	return CATEGORY_BAR_COLORS[name] ?? 'bg-primary'
}

export function MonthSpendingCard() {
	const spending = useMonthSpending()
	return (
		<Card data-testid='dashboard-month-spending-card' size='saved' className='mb-[-8px] gap-0 rounded-3xl'>
			{spending.status === 'loading' ? (
				<div data-testid='dashboard-month-spending-loading' aria-label='Loading monthly spending' className='flex flex-col gap-3 py-6'>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='h-4 w-48' />
				</div>
			) : null}
			{spending.status === 'error' ? (
				<div data-testid='dashboard-month-spending-error' role='alert' className='flex flex-col items-center justify-center gap-3 py-8 text-center'>
					<p className='text-sm text-muted-foreground'>We couldn’t load this month’s spending.</p>
					<Button type='button' variant='secondary' size='sm' onClick={spending.retry}>Try Again</Button>
				</div>
			) : null}
			{spending.status === 'ready' ? (() => {
				const { summary } = spending
				const receiptCount = summary.receipt_count ?? summary.receipts_count ?? 0
				const receiptTotal = summary.receipt_total ?? summary.total
				const changePercent = summary.change_percent ?? null
				const previousTotal = summary.previous_receipt_total ?? null
				const previousMonth = getPreviousMonthLabel(summary.from)
				const stores = summary.receipt_stores ?? []
				const storeTotal = stores.slice(0, 3).reduce((total, store) => total + store.total, 0)
				const storeShareTotal = storeTotal
				const categories = (summary.categories ?? []).slice(0, 3)
				const categoryTotal = categories.reduce((total, category) => total + category.total, 0)
				if (receiptCount === 0) {
					return <DashboardEmptyState testId='dashboard-month-spending-empty' icon={Invoice01Icon} tone='ocr' title='No receipt spending recorded this month.' message='Upload a receipt to see your spending here.' />
				}
				return (
					<div data-testid='dashboard-month-spending-summary' className='flex flex-col gap-3.5'>
						<div className='flex items-center justify-between gap-3'>
							<h2 className='text-base font-semibold tracking-tight'>Spend This Month</h2>
							<span className='shrink-0 font-mono text-xs text-muted-foreground'>{getMonthLabel(summary.from)}</span>
						</div>

						<div className='flex items-center justify-between gap-2'>
							<p className='font-mono text-[30px] leading-none font-semibold tracking-tight tabular-nums'>{formatCurrency(receiptTotal)}</p>
							{changePercent !== null ? (
								<span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-feedback-warning-subtle px-2.5 py-1 font-mono text-[11px] font-medium text-feedback-warning-strong'>
									<span aria-hidden='true'>{changePercent >= 0 ? '↑' : '↓'}</span>
									{Math.abs(changePercent)}% vs {previousMonth}
								</span>
							) : null}
						</div>

						{previousTotal !== null ? (
							<p className='text-xs leading-normal text-muted-foreground'>
								{formatCurrency(Math.abs(receiptTotal - previousTotal))} {receiptTotal >= previousTotal ? 'more' : 'less'} than {getPreviousMonthFullLabel(summary.from)} ({formatCurrency(previousTotal)})
							</p>
						) : null}

						{stores.length > 0 ? (
							<div data-testid='dashboard-month-spending-stores' aria-label='Spend by store' className='flex flex-col gap-2'>
								<div aria-hidden='true' className='flex h-3 overflow-hidden rounded-full bg-muted'>
									{stores.slice(0, 3).map((store, index) => {
										const colors = ['bg-primary', 'bg-blue-300 dark:bg-blue-700', 'bg-slate-300 dark:bg-slate-600']
										const width = storeShareTotal > 0 ? Math.min((store.total / storeShareTotal) * 100, 100) : 0
										return <span key={store.id} className={`${colors[index]} h-full`} style={{ width: `${width}%` }} />
									})}
								</div>
								<ul className='flex flex-col gap-1.5'>
									{stores.slice(0, 3).map((store, index) => {
										const colors = ['bg-primary', 'bg-blue-300 dark:bg-blue-700', 'bg-slate-300 dark:bg-slate-600']
										const share = storeShareTotal > 0 ? Math.round((store.total / storeShareTotal) * 100) : 0
										return (
											<li key={store.id} className='flex items-center gap-2 text-sm'>
												<span aria-hidden='true' className={`size-2.5 shrink-0 rounded-sm ${colors[index]}`} />
												<span className='min-w-0 flex-1 truncate'>{store.name}</span>
												<span className='w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground'>{share}%</span>
												<span className='w-[4.25rem] shrink-0 text-right font-mono font-semibold tabular-nums'>{formatCurrency(store.total)}</span>
											</li>
										)
									})}
								</ul>
							</div>
						) : null}

						<div className='grid grid-cols-[7fr_13fr] border-y border-border py-3 text-xs'>
							<div className='flex flex-col gap-1'>
								<span className='text-muted-foreground'>Receipts</span>
								<strong className='font-mono text-sm font-semibold tabular-nums'>{receiptCount}</strong>
								<span className='text-muted-foreground'>this month</span>
							</div>
							<div className='flex flex-col gap-1'>
								<span className='text-muted-foreground'>Avg per receipt</span>
								<strong className='font-mono text-sm font-semibold tabular-nums'>{summary.average_receipt == null ? '—' : formatCurrency(summary.average_receipt)}</strong>
								<span className='text-muted-foreground'>across {stores.length || summary.trips_count} stores</span>
							</div>
						</div>

						{categories.length > 0 ? (
							<div data-testid='dashboard-month-spending-categories' className='flex flex-col gap-2'>
								<h3 className='text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground'>Top Categories</h3>
								<ul className='flex flex-col gap-2'>
									{categories.map(category => {
										const width = categoryTotal > 0 ? (category.total / categoryTotal) * 100 : 0
										return (
											<li key={category.name} className='grid grid-cols-[4.75rem_minmax(0,1fr)_4.25rem] items-center gap-2 text-sm'>
												<span className='truncate'>{category.name}</span>
												<span aria-hidden='true' className='h-2 overflow-hidden rounded-full bg-muted'>
													<span className={`block h-full rounded-full ${getCategoryBarColor(category.name)}`} style={{ width: `${width}%` }} />
												</span>
												<span className='text-right font-mono text-sm font-semibold tabular-nums'>{formatCurrency(category.total)}</span>
												</li>
										)
									})}
								</ul>
							</div>
						) : null}

						<p className='text-xs leading-normal text-muted-foreground'>From {receiptCount} receipts. Trips without a receipt aren’t counted.</p>
					</div>
				)
			})() : null}
		</Card>
	)
}
