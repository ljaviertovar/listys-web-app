import { Dollar01Icon, TradeDownIcon, TradeUpIcon } from '@hugeicons/core-free-icons'

import { StatTile } from '@/components/commons'
import { Separator } from '@/components/ui/separator'
import type { SpendingSummary } from '@/lib/api/endpoints'
import { formatCurrency } from '@/utils'
import { buildSpendingSlices } from './helpers/spending-slices'
import { SpendingBreakdown } from './spending-breakdown'

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
	return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
		new Date(`${date.slice(0, 10)}T00:00:00Z`),
	)
}

function getPreviousMonthFullLabel(date: string) {
	const previous = new Date(`${date.slice(0, 10)}T00:00:00Z`)
	previous.setUTCMonth(previous.getUTCMonth() - 1)
	return new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(previous)
}

function getCategoryBarColor(name: string) {
	return CATEGORY_BAR_COLORS[name] ?? 'bg-primary'
}

interface MonthSpendingSummaryProps {
	summary: SpendingSummary
	receiptCount: number
}

/**
 * The month's spend, each fact once: the total and the receipts in the donut's hole, the stores and their shares in the legend,
 * the change and the average in two tiles, then the categories as a share of the month.
 */
export function MonthSpendingSummary({ summary, receiptCount }: MonthSpendingSummaryProps) {
	const receiptTotal = summary.receipt_total ?? summary.total
	const changePercent = summary.change_percent ?? null
	const slices = buildSpendingSlices(summary.receipt_stores ?? [], receiptTotal)
	const categories = (summary.categories ?? []).slice(0, 3)
	const largestCategory = Math.max(0, ...categories.map(category => category.total))
	const hasAverage = summary.average_receipt != null

	return (
		<div data-testid='dashboard-month-spending-summary' className='flex flex-col gap-3.5'>
			<div className='flex items-center justify-between gap-3'>
				<h2 className='text-base font-semibold tracking-tight'>Spend This Month</h2>
				<span className='shrink-0 font-mono text-xs text-muted-foreground'>{getMonthLabel(summary.from)}</span>
			</div>

			{slices.length > 0 ? (
				<SpendingBreakdown slices={slices} total={receiptTotal} receiptCount={receiptCount} testId='dashboard-month-spending-stores' />
			) : (
				<div className='flex flex-col gap-0.5'>
					<p className='font-mono text-[30px] leading-none font-semibold tracking-tight tabular-nums'>{formatCurrency(receiptTotal)}</p>
					<p className='text-xs text-muted-foreground'>
						{receiptCount} {receiptCount === 1 ? 'receipt' : 'receipts'}
					</p>
				</div>
			)}

			{changePercent !== null || hasAverage ? (
				<div data-testid='dashboard-month-spending-figures' className='flex gap-2'>
					{changePercent !== null ? (
						<StatTile
							testId='dashboard-month-spending-change'
							className='flex-auto'
							variant='white'
							icon={changePercent >= 0 ? TradeUpIcon : TradeDownIcon}
							iconTone={changePercent >= 0 ? 'warning' : 'success'}
							value={`${changePercent >= 0 ? '+' : '−'}${Math.abs(changePercent)}%`}
							label={`vs ${getPreviousMonthFullLabel(summary.from)}`}
						/>
					) : null}
					{hasAverage ? (
						<StatTile
							testId='dashboard-month-spending-average'
							className='flex-auto'
							variant='white'
							icon={Dollar01Icon}
							iconTone='primary'
							value={formatCurrency(summary.average_receipt ?? 0)}
							label='Avg per receipt'
						/>
					) : null}
				</div>
			) : null}

			{categories.length > 0 ? (
				<>
					<Separator />
					<div data-testid='dashboard-month-spending-categories' className='flex flex-col gap-2'>
						<h3 className='text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground'>Top Categories</h3>
						<ul className='flex flex-col gap-2'>
							{categories.map(category => {
								const width = largestCategory > 0 ? (category.total / largestCategory) * 100 : 0
								const share = receiptTotal > 0 ? Math.round((category.total / receiptTotal) * 100) : 0
								return (
									<li key={category.name} className='grid grid-cols-[4.75rem_minmax(0,1fr)_2rem_5.25rem] items-center gap-2 text-sm'>
										<span className='truncate'>{category.name}</span>
										<span aria-hidden='true' className='h-2 overflow-hidden rounded-full bg-muted'>
											<span className={`block h-full rounded-full ${getCategoryBarColor(category.name)}`} style={{ width: `${width}%` }} />
										</span>
										<span className='text-right font-mono text-xs tabular-nums text-muted-foreground'>{share}%</span>
										<span className='text-right font-mono text-sm font-semibold tabular-nums'>{formatCurrency(category.total)}</span>
									</li>
								)
							})}
						</ul>
					</div>
				</>
			) : null}

			<p className='text-xs leading-normal text-muted-foreground'>Trips without a receipt aren’t counted.</p>
		</div>
	)
}
