'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { AddToListIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { ABOVE_MOBILE_SESSION_BAR, ABOVE_MOBILE_UPLOAD_BUTTON } from '@/components/app/helpers/mobile-tab-bar-layout'
import { useActiveSessionStore } from '@/stores/active-session'
import { cn, formatCurrency } from '@/utils'

interface TicketSelectionBarProps {
	count: number
	total: number
	onClear: () => void
	onAdd: () => void
	/** `card` sticks to the bottom of the items card; `panel` is the plain footer of the compare view's list. */
	placement?: 'card' | 'panel'
}

/**
 * What the ticked items add up to and the one thing to do with them. On phones it floats above the tab bar's raised upload
 * button (and above the active-session bar when one is showing) so it never covers them; from `lg`, where it is rendered inside the items card, it sticks to the bottom of that card.
 */
export function TicketSelectionBar({ count, total, onClear, onAdd, placement = 'card' }: TicketSelectionBarProps) {
	const hasSessionBar = useActiveSessionStore(s => s.activeSession !== null)

	if (count === 0) return null

	return (
		<div
			data-testid='ticket-selection-bar'
			role='region'
			aria-label='Selection actions'
			className={cn(
				'fixed inset-x-3 z-40 flex items-center gap-2 rounded-3xl bg-card py-2.5 pr-2.5 pl-4 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_16px_32px_-12px_rgba(15,23,42,0.35)]',
				hasSessionBar ? ABOVE_MOBILE_SESSION_BAR : ABOVE_MOBILE_UPLOAD_BUTTON,
				'lg:z-10 lg:rounded-t-none lg:border-t lg:border-slate-100 lg:px-5 lg:py-3 lg:shadow-none dark:lg:border-border',
				placement === 'card'
					? 'lg:sticky lg:inset-x-0 lg:bottom-0 lg:-mx-3.5 lg:-mb-1.5 lg:mt-2 lg:rounded-b-3xl'
					: 'lg:static lg:m-0 lg:shrink-0 lg:rounded-none',
			)}
		>
			<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<span
					aria-live='polite'
					className='text-sm leading-[1.2] font-semibold'
				>
					<b className='font-mono font-semibold tabular-nums'>{count}</b> selected
				</span>
				<span className='font-mono text-xs leading-[1.2] font-medium text-slate-500 tabular-nums dark:text-muted-foreground'>
					{formatCurrency(total)}
				</span>
			</div>
			<Button
				type='button'
				variant='ghost'
				size='xl'
				onClick={onClear}
			>
				Clear
			</Button>
			<Button
				type='button'
				size='xl'
				onClick={onAdd}
			>
				<HugeiconsIcon
					icon={AddToListIcon}
					strokeWidth={1.8}
					className='size-4.5'
				/>
				Add to a List
			</Button>
		</div>
	)
}
