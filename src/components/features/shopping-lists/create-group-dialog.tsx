'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGroup } from '@/lib/api/endpoints/groups'
import { createGroupSchema, type CreateGroupInput } from '@/lib/validations/group'
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
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

export function CreateGroupDialog() {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CreateGroupInput>({
		resolver: zodResolver(createGroupSchema),
	})

	const onSubmit = async (data: CreateGroupInput) => {
		setLoading(true)

		try {
			const { error } = await createGroup(data)

			if (error) throw new Error(error)

			toast.success('Group created successfully')
			setOpen(false)
			reset()
			router.refresh()
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create group'
			toast.error(message)
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
				<Button
					className='w-full'
					data-testid='create-group-button'
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					New Group
				</Button>
			</DialogTrigger>
			<DialogContent
				onOpenAutoFocus={e => e.preventDefault()}
				className='w-11/12'
			>
				<DialogHeader>
					<DialogTitle>Create New Group</DialogTitle>
					<DialogDescription>Add a new group to organize your shopping lists</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>
								Name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='name'
								{...register('name')}
								placeholder='e.g., Groceries, Household'
								disabled={loading}
								className='text-base'
								required
							/>
							{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
						</div>
						<div className='space-y-2'>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								{...register('description')}
								placeholder='Add a description for this group'
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
							onClick={() => setOpen(false)}
							disabled={loading}
							className='flex-1'
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading}
							className='flex-1'
							data-testid='submit-group-button'
						>
							{loading && (
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className='h-4 w-4 animate-spin'
									data-icon='inline-start'
								/>
							)}
							{loading ? 'Creating…' : 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
