'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateGroup } from '@/actions/shopping-lists'
import { updateGroupSchema, type UpdateGroupInput } from '@/lib/validations/group'
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
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

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
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<UpdateGroupInput>({
		resolver: zodResolver(updateGroupSchema),
		defaultValues: { name: group.name, description: group.description || '' },
	})

	// Reset form when dialog opens or group changes
	useEffect(() => {
		if (open) {
			reset({ name: group.name, description: group.description || '' })
			setError(null)
		}
	}, [open, group, reset])

	const submit = async (data: UpdateGroupInput) => {
		setError(null)
		setLoading(true)

		try {
			const { error } = await updateGroup(group.id, {
				name: data.name,
				description: data.description || undefined,
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

	const watchedName = watch('name')

	return (
		<Dialog
			open={open}
			onOpenChange={isOpen => !loading && onOpenChange(isOpen)}
		>
			<DialogContent
				onOpenAutoFocus={e => e.preventDefault()}
				className='w-11/12'
			>
				<DialogHeader>
					<DialogTitle>Edit Group</DialogTitle>
					<DialogDescription>Update your group details</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(submit)}>
					<div className='space-y-4'>
						{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

						<div className='space-y-2'>
							<Label htmlFor='edit-name'>
								Name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='edit-name'
								{...register('name')}
								placeholder='e.g., Groceries, Household'
								disabled={loading}
								className='text-base'
							/>
							{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='edit-description'>Description</Label>
							<Textarea
								id='edit-description'
								{...register('description')}
								placeholder='A brief description of this group'
								rows={3}
								disabled={loading}
								className='text-base'
							/>
							{errors.description && <p className='text-xs text-destructive'>{errors.description.message}</p>}
						</div>

						<p className='text-xs text-muted-foreground'>
							<span className='text-destructive'>*</span> Required fields
						</p>
					</div>

					<DialogFooter className='mt-6 gap-4 flex-row'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={loading}
							className='flex-1'
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading || !watchedName?.trim()}
							className='flex-1'
						>
							{loading ? (
								<>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										className='mr-2 h-4 w-4 animate-spin'
									/>
									Saving…
								</>
							) : (
								'Save'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
