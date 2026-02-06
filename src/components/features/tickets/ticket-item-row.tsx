'use client'

import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { TicketItem } from '@/features/tickets/types'

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
			size='sm'
			role={canSelect ? 'button' : undefined}
			tabIndex={canSelect ? 0 : undefined}
			onKeyDown={canSelect ? handleKeyDown : undefined}
			onClick={canSelect ? () => onSelectToggle?.(item.id) : undefined}
			className={`transition-all cursor-pointer ${selected ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
		>
			<CardContent className='flex items-center gap-3 p-3'>
				{canSelect ? (
					<div onClick={handleToggle}>
						<Checkbox
							checked={selected}
							onCheckedChange={() => onSelectToggle?.(item.id)}
							aria-label={item.name}
						/>
					</div>
				) : null}

				<div className='flex-1'>
					<p className='text-sm font-bold truncate w-full max-w-[28ch]'>{item.name}</p>
					<div className='w-full flex justify-between items-center gap-4 mb-2'>
						<span className='text-sm text-muted-foreground'>
							{item.quantity || 1} {item.unit || 'pcs'}
						</span>

						{item.price !== null && (
							<span className='text-sm text-muted-foreground'>${item.price!.toFixed(2)} / unit</span>
						)}
					</div>
					<div className='flex items-center gap-2'>
						{item.category && <Badge variant='category'>{item.category}</Badge>}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
