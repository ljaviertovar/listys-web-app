'use client'

// Direct modules: the dashboard barrel also exports DashboardContent, which needs the server-only Supabase client.
import { MonthSpendingSummary } from '@/components/features/dashboard/month-spending-summary'
import { SpendingScopeSelect } from '@/components/features/dashboard/spending-scope-select'
import { Card } from '@/components/ui/card'
import type { SpendingSummary } from '@/lib/api/endpoints'

// A month of nine receipts: three named stores, two more folded into "Other", and the month before 8% higher.
const NOVEMBER: SpendingSummary = {
	from: '2026-11-01',
	to: '2026-11-30',
	receipts_count: 9,
	receipt_count: 9,
	total: 412.6,
	receipt_total: 412.6,
	trips_count: 9,
	trips_without_total: 0,
	average_receipt: 45.84,
	change_percent: -8,
	receipt_stores: [
		{ id: 'market-fresh', name: 'Market Fresh', total: 239.3 },
		{ id: 'no-frills', name: 'No Frills', total: 127.9 },
		{ id: 'mill-bakery', name: 'Mill Bakery', total: 28.9 },
		{ id: 'freshco', name: 'FreshCo', total: 10 },
		{ id: 'corner-deli', name: 'Corner Deli', total: 6.5 },
	],
	categories: [
		{ name: 'Produce', total: 98.4 },
		{ name: 'Dairy', total: 71.2 },
		{ name: 'Meat', total: 64.9 },
	],
}

/** The dashboard's Spend This Month card (MonthSpendingCard), drawn with its own header control and summary and a fixed month. */
export function SpendMonthMock() {
	return (
		<Card
			data-testid='landing-spend-this-month'
			size='spending'
		>
			<div className='flex flex-col gap-3.5'>
				<div className='flex items-center justify-between gap-3'>
					<SpendingScopeSelect
						value='month'
						onChange={() => undefined}
						testId='landing-spend-scope'
					/>
					<span className='shrink-0 font-mono text-xs text-muted-foreground'>Nov 2026</span>
				</div>
				<MonthSpendingSummary
					summary={NOVEMBER}
					receiptCount={9}
				/>
			</div>
		</Card>
	)
}
