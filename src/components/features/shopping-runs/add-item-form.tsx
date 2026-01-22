'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { createShoppingRunItem } from '@/actions/shopping-runs'
import { CATEGORIES, UNITS } from '@/data/constants'

interface Props {
	runId: string
	onSuccess?: () => void
}

export function AddItemForm({ runId, onSuccess }: Props) {
	const [name, setName] = useState('')
	const [quantity, setQuantity] = useState('')
	const [unit, setUnit] = useState('')
	const [category, setCategory] = useState('')
	const [notes, setNotes] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const { error: createError } = await createShoppingRunItem({
				shopping_run_id: runId,
				name,
				quantity: quantity ? parseFloat(quantity) : undefined,
				unit: unit || undefined,
				category: category || undefined,
				notes: notes || undefined,
			})

			if (createError) throw new Error(createError)

			// Reset form
			setName('')
			setQuantity('')
			setUnit('')
			setCategory('')
			setNotes('')
			router.refresh()
			onSuccess?.()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add item')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'
		>
			{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-2 sm:col-span-2'>
					<Label htmlFor='name'>Item Name *</Label>
					<Input
						id='name'
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='e.g., Milk'
						required
						disabled={loading}
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='quantity'>Quantity</Label>
					<Input
						id='quantity'
						type='number'
						step='0.01'
						value={quantity}
						onChange={e => setQuantity(e.target.value)}
						placeholder='e.g., 2'
						disabled={loading}
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='unit'>Unit</Label>
					<Select
						value={unit}
						onValueChange={setUnit}
						disabled={loading}
					>
						<SelectTrigger id='unit'>
							<SelectValue placeholder='Select unit' />
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

				<div className='space-y-2 sm:col-span-2'>
					<Label htmlFor='category'>Category</Label>
					<Select
						value={category}
						onValueChange={setCategory}
						disabled={loading}
					>
						<SelectTrigger id='category'>
							<SelectValue placeholder='Select category' />
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
				</div>

				<div className='space-y-2 sm:col-span-2'>
					<Label htmlFor='notes'>Notes</Label>
					<Textarea
						id='notes'
						value={notes}
						onChange={e => setNotes(e.target.value)}
						placeholder='Add any notes...'
						rows={2}
						disabled={loading}
					/>
				</div>
			</div>

			<Button
				type='submit'
				disabled={loading || !name.trim()}
				className='w-full'
			>
				{loading ? (
					<>
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='mr-2 h-4 w-4 animate-spin'
						/>
						Adding...
					</>
				) : (
					<>
						<HugeiconsIcon
							icon={PlusSignIcon}
							strokeWidth={2}
							data-icon='inline-start'
						/>
						Add Item
					</>
				)}
			</Button>
		</form>
	)
}
