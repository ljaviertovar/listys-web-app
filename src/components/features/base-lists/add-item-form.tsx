'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBaseListItem } from '@/actions/base-lists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { CATEGORIES, UNITS } from '@/data/constants'

interface Props {
	baseListId: string
}

export function AddItemForm({ baseListId }: Props) {
	const [name, setName] = useState('')
	const [quantity, setQuantity] = useState('1')
	const [unit, setUnit] = useState('')
	const [category, setCategory] = useState('')
	const [notes, setNotes] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const { error } = await createBaseListItem({
				base_list_id: baseListId,
				name,
				quantity: parseFloat(quantity) || 1,
				unit: unit || undefined,
				category: category || undefined,
				notes: notes || undefined,
			})

			if (error) throw new Error(error)

			// Reset form
			setName('')
			setQuantity('1')
			setUnit('')
			setCategory('')
			setNotes('')
			router.refresh()
		} catch (err: any) {
			setError(err.message || 'Failed to add item')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 rounded-lg border p-4'
		>
			{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-2'>
					<Input
						placeholder='Item name *'
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
				</div>
				<div className='flex gap-2'>
					<Input
						type='number'
						step='0.01'
						placeholder='Qty'
						value={quantity}
						onChange={e => setQuantity(e.target.value)}
						className='w-20'
					/>
					<Select
						value={unit}
						onValueChange={setUnit}
					>
						<SelectTrigger className='w-32'>
							<SelectValue placeholder='Unit' />
						</SelectTrigger>
						<SelectContent>
							{UNITS.map(u => (
								<SelectItem
									key={u}
									value={u}
								>
									{u}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<Select
					value={category}
					onValueChange={setCategory}
				>
					<SelectTrigger>
						<SelectValue placeholder='Category (optional)' />
					</SelectTrigger>
					<SelectContent>
						{CATEGORIES.map(cat => (
							<SelectItem
								key={cat}
								value={cat}
							>
								{cat}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					placeholder='Notes (optional)'
					value={notes}
					onChange={e => setNotes(e.target.value)}
				/>
			</div>

			<Button
				type='submit'
				disabled={loading}
				className='w-full'
			>
				<HugeiconsIcon
					icon={PlusSignIcon}
					strokeWidth={2}
					data-icon='inline-start'
				/>
				{loading ? 'Adding...' : 'Add Item'}
			</Button>
		</form>
	)
}
