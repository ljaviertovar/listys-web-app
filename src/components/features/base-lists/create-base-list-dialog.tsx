'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
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
import { createBaseList } from '@/lib/api/endpoints/base-lists'
import { createBaseListSchema, type CreateBaseListInput } from '@/lib/validations/base-list'
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

interface Props {
	groupId: string
}

export function CreateBaseListDialog({ groupId }: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CreateBaseListInput>({
		resolver: zodResolver(createBaseListSchema),
		defaultValues: {
			group_id: groupId,
			notes: '',
		},
	})

	const onSubmit = async (data: CreateBaseListInput) => {
		setLoading(true)

		try {
			const { data: baseList, error } = await createBaseList({
				...data,
				notes: data.notes?.trim() ? data.notes.trim() : null,
			})

			if (error) throw new Error(error)

			toast.success('Base list created successfully')
			setOpen(false)
			reset({ group_id: groupId, notes: '' })

			// Redirect to edit page to add items
			if (baseList?.id) {
				router.push(`/base-lists/${baseList.id}/edit`)
			} else {
				router.refresh()
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create base list'
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
					data-testid='create-list-button'
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					New Base List
				</Button>
			</DialogTrigger>
			<DialogContent
				onOpenAutoFocus={e => e.preventDefault()}
				className='w-11/12'
			>
				<DialogHeader>
					<DialogTitle>Create New Base List</DialogTitle>
					<DialogDescription>Add a reusable shopping list template</DialogDescription>
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
								placeholder='e.g., Weekly Groceries, Monthly Supplies'
								disabled={loading}
								className='text-base'
							/>
							{errors.name && <p className='text-sm text-destructive'>{errors.name.message}</p>}
						</div>
						<div className='space-y-2'>
							<Label htmlFor='notes'>Notes</Label>
							<Textarea
								id='notes'
								{...register('notes')}
								placeholder='Optional notes for this list'
								disabled={loading}
								className='text-base min-h-20'
							/>
							{errors.notes && <p className='text-sm text-destructive'>{errors.notes.message}</p>}
						</div>
						<p className='text-xs text-muted-foreground'>
							<span className='text-destructive'>*</span> Required fields
						</p>
					</div>
					<DialogFooter className='flex-row gap-4 mt-6'>
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
							data-testid='submit-list-button'
						>
							{loading && (
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className='h-4 w-4 animate-spin'
									data-icon='inline-start'
								/>
							)}
							{loading ? 'Creating…' : 'Create List'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
