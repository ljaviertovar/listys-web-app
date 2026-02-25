'use client'

import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

import type { TicketItem } from '@/features/tickets/types'
import { Badge } from '@/components/ui/badge'

interface Props {
	item: TicketItem
	canSelect?: boolean
	selected?: boolean
	onSelectToggle?: (id: string) => void
}

export function TicketItemRow({ item, canSelect = false, selected = false, onSelectToggle }: Props) {
	const handleToggle = (e?: React.MouseEvent) => {
		e?.stopPropagation()
		if (!canSelect || !onSelectToggle) return
		onSelectToggle(item.id)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!canSelect || !onSelectToggle) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onSelectToggle(item.id)
		}
	}

	return (
		<Card
			size='compact'
			role={canSelect ? 'button' : undefined}
			tabIndex={canSelect ? 0 : undefined}
			onKeyDown={canSelect ? handleKeyDown : undefined}
			onClick={canSelect ? () => onSelectToggle?.(item.id) : undefined}
			className={`transition-all cursor-pointer p-0 ${selected ? 'border-primary bg-primary/5' : 'hover:bg-primary/1 hover:border-primary/50'}`}
		>
			<CardContent className='flex items-center gap-3 p-4'>
				<div className='flex flex-col flex-1 gap-2'>
					<p className='text-sm font-bold truncate w-full max-w-[28ch]'>{item.name}</p>
					<div className='w-full flex justify-between items-center gap-4'>
						<Badge
							variant={'secondary'}
							className={`h-7 min-w-12 justify-center rounded-lg px-2 py-0 font-bold text-sm uppercase transition-all bg-accent text-accent-foreground`}
						>
							{item.quantity ?? 1}
							<span className='ml-0.5 text-xs font-medium lowercase opacity-60'>{item.unit || 'pcs'}</span>
						</Badge>

						{item.price !== null && <span className='text-sm text-muted-foreground'>${item.price!.toFixed(2)}</span>}
					</div>
				</div>
				{canSelect ? (
					<div
						onClick={e => e.stopPropagation()}
						className='ml-6 mt-0.5'
					>
						<Checkbox
							checked={selected}
							onCheckedChange={() => onSelectToggle?.(item.id)}
							aria-label={item.name}
							className='w-5 h-5 rounded-lg'
						/>
					</div>
				) : null}
			</CardContent>
		</Card>
	)
}
