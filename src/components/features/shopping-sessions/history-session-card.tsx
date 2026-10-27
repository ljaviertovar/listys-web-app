'use client'

import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActionLink } from '@/components/commons'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate, formatTime } from '@/utils'

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
	store?: { id: string; name: string } | null
}

interface Props {
	session: Session
	href?: string
}

/**
 * A completed trip in the shopping history (design: Mobile historial). The card is plain; only "View Details" is a link,
 * so the rest of the card does not react to taps or hover.
 */
export function HistorySessionCard({ session, href }: Props) {
	const completedDate = session.completed_at ? new Date(session.completed_at) : null
	const purchasedCount =
		session.purchased_count ??
		(session.shopping_session_items
			? session.shopping_session_items.filter(i => i.checked === true).length
			: session.total_items ?? null)

	const completedText = completedDate
		? `Completed on ${formatDate(completedDate)} - ${formatTime(completedDate)}`
		: 'Date unknown'
	const totalText = session.total_amount == null ? '' : ` · ${formatCurrency(session.total_amount)}`

	return (
		<Card
			size='tight'
			data-testid={`history-card-${session.id}`}
		>
			<div className='flex flex-col gap-3'>
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
							{session.store ? ` · ${session.store.name}` : ''}
						</p>
					</div>
				</div>

				<div className='flex items-center justify-between gap-2 border-t border-slate-100 pt-3'>
					{purchasedCount === null ? (
						<span className='text-xs leading-[1.25] font-medium text-slate-500'>Item count unavailable</span>
					) : (
						<span className='flex items-baseline gap-1.5'>
							<b className='font-mono text-base font-semibold tabular-nums'>{purchasedCount}</b>
							<span className='text-xs leading-[1.25] font-medium text-slate-500'>
								{purchasedCount === 1 ? 'Purchased Item' : 'Purchased Items'}
							</span>
						</span>
					)}
					<ActionLink href={href ?? `/shopping/${session.id}`} aria-label={`View details for ${session.name}`} className='shrink-0'>
						View Details
					</ActionLink>
				</div>
			</div>
		</Card>
	)
}
