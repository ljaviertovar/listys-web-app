'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/actions/ticket-groups'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

export function CreateGroupDialog() {
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const { error } = await createGroup({ name, description: description || undefined })

			if (error) throw new Error(error)

			setOpen(false)
			setName('')
			setDescription('')
			router.refresh()
		} catch (err: any) {
			setError(err.message || 'Failed to create group')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					New Group
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Group</DialogTitle>
					<DialogDescription>Add a new group to organize your shopping lists</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='space-y-4'>
						{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}
						<div className='space-y-2'>
							<Label htmlFor='name'>Name</Label>
							<Input
								id='name'
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder='e.g., Groceries, Household'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='description'>Description (optional)</Label>
							<Textarea
								id='description'
								value={description}
								onChange={e => setDescription(e.target.value)}
								placeholder='Add a description...'
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter className='mt-6'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading}
						>
							{loading ? 'Creating...' : 'Create Group'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
