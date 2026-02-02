'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { toggleShoppingRunItem } from '@/actions/shopping-runs'
import type { ShoppingRunItem } from '@/features/shopping-runs/types'
import { Badge } from '@/components/ui/badge'

interface Props {
	item: ShoppingRunItem
	isCompleted?: boolean
}

export function ShoppingRunItemRow({ item, isCompleted = false }: Props) {
	const [checked, setChecked] = useState(item.checked)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleToggle = async () => {
		if (isCompleted) return // Don't allow toggling completed runs

		const newChecked = !checked
		setChecked(newChecked) // Optimistic update
		setLoading(true)

		try {
			const { error } = await toggleShoppingRunItem(item.id, newChecked)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			setChecked(!newChecked) // Revert on error
			console.error('Failed to toggle item:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleCardClick = () => {
		if (loading || isCompleted) return
		handleToggle()
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (loading || isCompleted) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			handleToggle()
		}
	}

	return (
		<Card
			size='sm'
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			className={`transition-all cursor-pointer ${
				checked ? 'bg-muted dark:border-green-900/40 dark:bg-green-950/10' : 'hover:bg-muted'
			}`}
		>
			<CardContent className='p-0'>
				<div className='flex items-start gap-3'>
					<div onClick={e => e.stopPropagation()}>
						<Checkbox
							checked={checked ?? false}
							onCheckedChange={handleToggle}
							disabled={loading || isCompleted}
							className='mt-0.5 w-5 h-5'
						/>
					</div>

					<div className='grid flex-1 gap-1.5 font-normal'>
						<div className='flex items-baseline gap-2'>
							<p className={`text-sm font-bold leading-none ${checked ? 'line-through text-muted-foreground' : ''}`}>
								{item.name}
							</p>
							{item.quantity && (
								<span className='text-sm text-muted-foreground'>
									{item.quantity}
									{item.unit && ` ${item.unit}`}
								</span>
							)}
						</div>

						<div className='flex gap-2'>{item.category && <Badge variant={'category'}>{item.category}</Badge>}</div>
						{item.notes && (
							<p className='text-xs md:text-sm text-muted-foreground'>
								{'> '} {item.notes}
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
