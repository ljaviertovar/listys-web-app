'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateGroup } from '@/actions/ticket-groups'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Group {
	id: string
	name: string
	description?: string | null
}

interface Props {
	group: Group
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditGroupDialog({ group, open, onOpenChange }: Props) {
	const [name, setName] = useState(group.name)
	const [description, setDescription] = useState(group.description || '')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			setName(group.name)
			setDescription(group.description || '')
			setError(null)
		}
	}, [open, group])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const { error } = await updateGroup(group.id, {
				name,
				description: description || undefined,
			})

			if (error) throw new Error(error)

			onOpenChange(false)
			router.refresh()
		} catch (err: any) {
			setError(err.message || 'Failed to update group')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Group</DialogTitle>
					<DialogDescription>Update your group details</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='space-y-4'>
						{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}
						<div className='space-y-2'>
							<Label htmlFor='edit-name'>Name</Label>
							<Input
								id='edit-name'
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder='e.g., Groceries, Household'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-description'>Description (optional)</Label>
							<Textarea
								id='edit-description'
								value={description}
								onChange={e => setDescription(e.target.value)}
								placeholder='A brief description of this group'
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter className='mt-6'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading || !name.trim()}
						>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
