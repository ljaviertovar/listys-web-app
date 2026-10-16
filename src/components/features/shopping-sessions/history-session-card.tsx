'use client'

import Link from 'next/link'
import { ArrowRight01Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card } from '@/components/ui/card'
import { formatDate, formatTime } from '@/utils'

interface Session {
	id: string
	name: string
	status: string | null
	started_at: string | null
	completed_at: string | null
	total_amount: number | null
	total_items?: number | null
	purchased_count?: number | null
	shopping_session_items?: Array<{ id: string; checked: boolean | null }> | null
	base_list: { name: string } | null
}

interface Props {
	session: Session
	href?: string
}

/**
 * A completed session in a group's history (design: Mobile historial grupo). The card is plain; only "View Details" is a link,
 * so the rest of the card does not react to taps or hover.
 */
export function HistorySessionCard({ session, href }: Props) {
	const completedDate = session.completed_at ? new Date(session.completed_at) : null
	const purchasedCount =
		session.purchased_count ??
		session.shopping_session_items?.filter(i => i.checked === true).length ??
		session.total_items ??
		0

	const completedText = completedDate
		? `Completed on ${formatDate(completedDate)} - ${formatTime(completedDate)}`
		: 'Date unknown'
	const totalText = session.total_amount ? ` · $${session.total_amount.toFixed(2)}` : ''

	return (
		<Card
			size='tight'
			data-testid={`history-card-${session.id}`}
		>
			<div className='flex flex-col gap-3 p-0.5'>
				<div className='flex items-center gap-3'>
					<span
						aria-hidden='true'
						className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 text-blue-600'
					>
						<HugeiconsIcon
							icon={ShoppingCart02Icon}
							strokeWidth={1.5}
							className='size-4.5'
						/>
					</span>
					<div className='flex min-w-0 flex-1 flex-col gap-1'>
						<h2 className='font-display text-base leading-[1.3] font-semibold tracking-[-0.005em]'>{session.name}</h2>
						<p className='text-xs leading-[1.4] text-slate-500'>
							{completedText}
							{totalText}
						</p>
					</div>
				</div>

				<div className='flex items-center justify-between gap-2 border-t border-slate-100 pt-3'>
					<span className='flex items-baseline gap-1.5'>
						<b className='font-mono text-base font-semibold tabular-nums'>{purchasedCount}</b>
						<span className='text-xs leading-[1.25] font-medium text-slate-500'>
							{purchasedCount === 1 ? 'Purchased Item' : 'Purchased Items'}
						</span>
					</span>
					<Link
						href={href ?? `/shopping/${session.id}`}
						className='inline-flex min-h-11 items-center gap-0.5 py-0 pr-1 pl-3 font-display text-sm font-semibold text-blue-700'
					>
						View Details
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							strokeWidth={2}
							className='size-4'
						/>
					</Link>
				</div>
			</div>
		</Card>
	)
}
