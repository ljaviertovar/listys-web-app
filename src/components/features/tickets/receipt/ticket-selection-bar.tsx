'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { SelectionBar } from '@/components/commons'
import { formatCurrency } from '@/utils'

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

/** What the ticked items add up to and the one thing to do with them. */
export function TicketSelectionBar({
	count,
	total,
	onClear,
	onAdd,
	breakdown = null,
	placement = 'card',
	saving = false,
}: TicketSelectionBarProps) {
	if (count === 0) return null

	return (
		<SelectionBar
			testId='ticket-selection-bar'
			ariaLabel={saving ? 'Saving to your list' : 'Selection actions'}
			busy={saving}
			placement={placement}
			summary={
				<>
					<span
						aria-live='polite'
						className='text-sm leading-[1.2] font-medium'
					>
						<b className='font-mono font-medium tabular-nums'>{count}</b> included
					</span>
					<span className='text-xs leading-[1.2] text-slate-300'>
						{breakdown ? (
							<span
								data-testid='ticket-selection-breakdown'
								className='whitespace-nowrap'
							>
								{breakdown.added} new · {breakdown.updated} updated
							</span>
						) : (
							<span className='font-mono tabular-nums'>{formatCurrency(total)}</span>
						)}
					</span>
				</>
			}
		>
			<Button
				type='button'
				variant='on-dark-ghost'
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
				{saving ? (
					<HugeiconsIcon
						icon={Loading03Icon}
						strokeWidth={1.5}
						aria-hidden='true'
						className='animate-spin motion-reduce:animate-none'
					/>
				) : null}
				{saving ? 'Saving…' : 'Add or Update'}
			</Button>
		</SelectionBar>
	)
}
