'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleShoppingRunItem } from '@/actions/shopping-runs'
import type { ShoppingRunItem } from '@/features/shopping-runs/types'

interface Props {
	item: ShoppingRunItem
}

export function ShoppingRunItemRow({ item }: Props) {
	const [checked, setChecked] = useState(item.checked)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleToggle = async () => {
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

	return (
		<div
			className={`rounded-lg border p-4 transition-all ${
				checked
					? 'border-green-200/60 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/10'
					: 'border-border bg-card hover:bg-accent/50'
			}`}
		>
			<div className='flex items-start gap-3'>
				<Checkbox
					checked={checked}
					onCheckedChange={handleToggle}
					disabled={loading}
					className='mt-0.5 w-5 h-5'
				/>

				<div className='grid flex-1 gap-1.5 font-normal'>
					<div className='flex items-baseline gap-2'>
						<p className={`text-sm font-medium leading-none ${checked ? 'line-through text-muted-foreground' : ''}`}>
							{item.name}
						</p>
						{item.quantity && (
							<span className='text-sm text-muted-foreground'>
								{item.quantity}
								{item.unit && ` ${item.unit}`}
							</span>
						)}
					</div>

					{(item.category || item.notes) && (
						<div className='space-y-1'>
							{item.category && (
								<p className='text-xs text-muted-foreground'>
									<span className='rounded-md bg-secondary px-1.5 py-0.5'>{item.category}</span>
								</p>
							)}
							{item.notes && <p className='text-sm text-muted-foreground'>{item.notes}</p>}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
