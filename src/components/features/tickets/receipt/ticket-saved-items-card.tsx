'use client'

import { ListViewIcon } from '@hugeicons/core-free-icons'

import { CategorySection } from '@/components/commons'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatItemName } from '@/utils'
import type { TicketItem } from '@/types'

interface TicketSavedItemsCardProps {
	items: TicketItem[]
}

/** The lines of a receipt that already went into a list: one folding "Items" section, read only (nothing to include or compare any more). */
export function TicketSavedItemsCard({ items }: TicketSavedItemsCardProps) {
	return (
		<Card data-testid='ticket-saved-items-card' size='list'>
			<CategorySection
				category='items'
				title='Items'
				tone='ocr'
				icon={ListViewIcon}
				count={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
				testId='ticket-saved-items'
				className='border-t-0'
			>
				<ul className='divide-y divide-slate-200/70 px-3 dark:divide-border'>
					{items.map(item => (
						<li
							key={item.id}
							data-testid={`ticket-saved-item-${item.id}`}
							className='flex min-h-15 items-center justify-between gap-2 py-1.5'
						>
							<span className='min-w-0 flex-1 truncate text-sm leading-[1.3] font-semibold'>{formatItemName(item.name)}</span>
							{item.price !== null ? <span className='font-mono text-sm font-semibold whitespace-nowrap tabular-nums'>{formatCurrency(item.price)}</span> : null}
						</li>
					))}
				</ul>
			</CategorySection>
			<div className='h-3 md:h-4' aria-hidden='true' />
		</Card>
	)
}
