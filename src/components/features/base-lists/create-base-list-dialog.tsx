'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBaseList } from '@/actions/base-lists'
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
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons'

interface Props {
	groupId: string
}

export function CreateBaseListDialog({ groupId }: Props) {
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const { error } = await createBaseList({ group_id: groupId, name })

			if (error) throw new Error(error)

			setOpen(false)
			setName('')
			router.refresh()
		} catch (err: any) {
			setError(err.message || 'Failed to create base list')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={isOpen => !loading && setOpen(isOpen)}
		>
			<DialogTrigger asChild>
				<Button>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					New Base List
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Base List</DialogTitle>
					<DialogDescription>Add a reusable shopping list template</DialogDescription>
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
								placeholder='e.g., Weekly Groceries, Monthly Supplies'
								required
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
							{loading ? (
								<>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										className='mr-2 h-4 w-4 animate-spin'
									/>
									Creating...
								</>
							) : (
								'Create List'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
