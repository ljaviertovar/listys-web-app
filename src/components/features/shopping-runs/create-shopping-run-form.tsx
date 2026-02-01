'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createShoppingRun } from '@/actions/shopping-runs'

interface Props {
	baseListId: string
	defaultName: string
}

export function CreateShoppingRunForm({ baseListId, defaultName }: Props) {
	const [name, setName] = useState(defaultName)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const { data, error: createError } = await createShoppingRun({
				base_list_id: baseListId,
				name,
			})

			if (createError) throw new Error(createError)
			if (!data) throw new Error('Failed to create shopping run')

			router.push(`/shopping/${data.id}`)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create shopping run')
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

			<div className='space-y-2'>
				<Label htmlFor='name'>Shopping Run Name</Label>
				<Input
					id='name'
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder='Enter shopping run name'
					required
					disabled={loading}
					className='text-base'
				/>
			</div>

			<div className='flex gap-2'>
				<Button
					type='submit'
					disabled={loading || !name.trim()}
					className='flex-1'
				>
					{loading ? 'Creating...' : 'Start Shopping Run'}
				</Button>
				<Button
					type='button'
					variant='outline'
					onClick={() => router.back()}
					disabled={loading}
				>
					Cancel
				</Button>
			</div>
		</form>
	)
}
