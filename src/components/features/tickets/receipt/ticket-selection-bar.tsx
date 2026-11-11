'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import {
	ABOVE_MOBILE_ACTION_BAR,
	ABOVE_MOBILE_ACTION_BAR_WITH_SESSION,
} from '@/components/app/helpers/mobile-tab-bar-layout'
import { useActiveSessionStore } from '@/stores/active-session'
import { cn, formatCurrency } from '@/utils'

import type { ReceiptSelectionBreakdown } from './helpers/receipt-selection-breakdown'

interface TicketSelectionBarProps {
	count: number
	total: number
	onClear: () => void
	onAdd: () => void
	/** How many included lines add an item and how many update one, once the lines are compared with a list. */
	breakdown?: ReceiptSelectionBreakdown | null
	/** `card` sticks to the bottom of the items card; `panel` is the plain footer of the compare view's list. */
	placement?: 'card' | 'panel'
	/** The lines are on their way to the list: both actions rest and the button says so. */
	saving?: boolean
}

/**
 * What the ticked items add up to and the one thing to do with them. On phones it floats above the tab bar's raised upload
 * button (and above the active-session bar when one is showing) so it never covers them; from `lg`, where it is rendered inside the items card, it sticks to the bottom of that card.
 */
export function TicketSelectionBar({ count, total, onClear, onAdd, breakdown = null, placement = 'card', saving = false }: TicketSelectionBarProps) {
	const hasSessionBar = useActiveSessionStore(s => s.activeSession !== null)

	if (count === 0) return null

	return (
		<div
			data-testid='ticket-selection-bar'
			role='region'
			aria-label={saving ? 'Saving to your list' : 'Selection actions'}
			aria-busy={saving || undefined}
			className={cn(
				'fixed inset-x-3 z-40 flex min-h-14 items-center gap-2 rounded-2xl bg-slate-900 py-2 pr-2 pl-4 text-white shadow-[0_16px_32px_-12px_rgba(15,23,42,0.5)]',
				hasSessionBar ? ABOVE_MOBILE_ACTION_BAR_WITH_SESSION : ABOVE_MOBILE_ACTION_BAR,
				'lg:z-10 lg:rounded-t-none lg:px-5 lg:py-3 lg:shadow-none',
				placement === 'card'
					? 'lg:sticky lg:inset-x-0 lg:bottom-0 lg:-mx-3.5 lg:-mb-1.5 lg:mt-2 lg:rounded-b-3xl'
					: 'lg:static lg:m-0 lg:shrink-0 lg:rounded-none',
			)}
		>
			<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<span
					aria-live='polite'
					className='text-sm leading-[1.2] font-medium'
				>
					<b className='font-mono font-semibold tabular-nums'>{count}</b> included
				</span>
				<span className='text-xs leading-[1.2] text-slate-300'>
					{breakdown ? (
						<span data-testid='ticket-selection-breakdown' className='whitespace-nowrap'>{breakdown.added} new · {breakdown.updated} updated</span>
					) : (
						<span className='font-mono tabular-nums'>{formatCurrency(total)}</span>
					)}
				</span>
			</div>
			<Button
				type='button'
				variant='quiet-on-dark'
				size='sm'
				onClick={onClear}
				disabled={saving}
			>
				Clear
			</Button>
			<Button
				type='button'
				size='sm'
				onClick={onAdd}
				disabled={saving}
				aria-busy={saving || undefined}
			>
				{saving ? <HugeiconsIcon icon={Loading03Icon} strokeWidth={1.5} aria-hidden='true' className='animate-spin motion-reduce:animate-none' /> : null}
				{saving ? 'Saving…' : 'Add or Update'}
			</Button>
		</div>
	)
}
