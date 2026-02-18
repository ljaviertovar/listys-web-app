'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ListViewIcon, Edit02Icon, Delete02Icon, Loading03Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { deleteBaseList, updateBaseList } from '@/lib/api/endpoints/base-lists'

import type { BaseListWithCount } from '@/features/base-lists/types'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ActiveShoppingBadge } from '@/components/app/active-shopping-badge'
import { Separator } from '@/components/ui/separator'

interface Props {
	baseList: BaseListWithCount
	isActiveRun?: boolean
}

export function BaseListCard({ baseList, isActiveRun = false }: Props) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [loading, setLoading] = useState(false)
	const [editing, setEditing] = useState(false)
	const router = useRouter()

	const editBaseListSchema = z.object({
		name: z.string().min(1, 'Name is required').max(100),
		notes: z.string().max(200, 'Notes cannot exceed 200 characters').optional(),
	})

	type EditBaseListFormData = z.infer<typeof editBaseListSchema>

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<EditBaseListFormData>({
		resolver: zodResolver(editBaseListSchema),
		defaultValues: {
			name: baseList.name,
			notes: baseList.notes ?? '',
		},
	})

	const watchedName = watch('name')

	const handleDelete = async () => {
		setLoading(true)
		try {
			const { error } = await deleteBaseList(baseList.id)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			console.error('Failed to delete list:', err)
		} finally {
			setLoading(false)
			setShowDeleteDialog(false)
		}
	}

	const handleEditSave = async (data: EditBaseListFormData) => {
		setLoading(true)
		try {
			const normalizedNotes = data.notes?.trim() ? data.notes.trim() : null
			const normalizedName = data.name.trim()
			const { error } = await updateBaseList(baseList.id, {
				name: normalizedName,
				notes: normalizedNotes,
			})

			if (error) throw new Error(error)

			setEditing(false)
			router.refresh()
			toast.success('Base list updated')
		} catch (err) {
			console.error('Failed to update base list:', err)
			const message = err instanceof Error ? err.message : 'Failed to update base list'
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	const handleEditCancel = () => {
		reset({
			name: baseList.name,
			notes: baseList.notes ?? '',
		})
		setEditing(false)
	}

	const baseListNotes = baseList.notes

	if (editing) {
		return (
			<Card
				className='hover:border-primary/50 transition-colors gap-2'
				size='sm'
				data-testid={`list-card-${baseList.id}`}
			>
				<CardHeader className='gap-2'>
					<form
						onSubmit={handleSubmit(handleEditSave)}
						className='space-y-2'
					>
						<Input
							{...register('name')}
							disabled={loading}
							aria-invalid={!!errors.name}
							required
						/>
						<Textarea
							{...register('notes')}
							disabled={loading}
							placeholder='Description (optional)'
							className='min-h-20'
						/>
						<div>
							{errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
							{errors.notes && <p className='text-xs text-destructive'>{errors.notes.message}</p>}
						</div>
						<div className='flex items-center justify-end gap-2'>
							<Button
								type='button'
								size='sm'
								variant='outline'
								onClick={handleEditCancel}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								size='sm'
								disabled={loading || !watchedName?.trim()}
							>
								{loading && (
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										className='h-4 w-4 animate-spin'
										data-icon='inline-start'
									/>
								)}
								{loading ? 'Saving…' : 'Save'}
							</Button>
						</div>
					</form>
				</CardHeader>
			</Card>
		)
	}

	return (
		<>
			<Link href={`/base-lists/${baseList.id}/edit`}>
				<Card
					className={`hover:border-primary/50 transition-colors gap-2 cursor-pointer group`}
					size='sm'
					data-testid={`list-card-${baseList.id}`}
				>
					<CardHeader className='gap-0'>
						<div className='flex items-center justify-end gap-1'>
							{isActiveRun && <ActiveShoppingBadge />}
							{!isActiveRun && (
								<>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8'
										onClick={e => {
											e.preventDefault()
											e.stopPropagation()
											setEditing(true)
										}}
										disabled={loading}
										aria-label='Edit list'
									>
										<HugeiconsIcon
											icon={Edit02Icon}
											strokeWidth={2}
											className='h-4 w-4'
										/>
									</Button>
									<Button
										variant='ghost'
										size='icon'
										onClick={e => {
											e.preventDefault()
											e.stopPropagation()
											setShowDeleteDialog(true)
										}}
										disabled={loading}
										className='h-8 w-8'
										aria-label='Delete list'
									>
										<HugeiconsIcon
											icon={Delete02Icon}
											strokeWidth={2}
										/>
									</Button>
								</>
							)}
						</div>
						<div className='flex gap-2 items-center'>
							<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-lg'>
								<HugeiconsIcon
									icon={ListViewIcon}
									strokeWidth={2}
									className='h-5 w-5 text-primary'
								/>
							</span>
							<div className='flex flex-col flex-1 min-w-0'>
								<CardTitle className='text-base md:text-lg truncate w-full max-w-[25ch] md:max-w-[20ch]'>
									{baseList.name}
								</CardTitle>
								{baseListNotes && (
									<CardDescription className='flex items-center gap-1'>
										<Separator
											orientation='vertical'
											className='border-primary/20 border'
										/>
										<p className='text-xs md:text-sm text-muted-foreground'>{baseListNotes}</p>
									</CardDescription>
								)}
							</div>
						</div>
					</CardHeader>
					<CardFooter className='justify-between items-center'>
						<span>
							{baseList.items_count} {baseList.items_count === 1 ? 'item' : 'items'}
						</span>

						<div className='flex items-center text-sm text-primary transition-colors'>
							<span>View Items</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className='h-4 w-4 transition-transform group-hover:translate-x-1'
							/>
						</div>
					</CardFooter>
				</Card>
			</Link>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent size='sm'>
					<AlertDialogHeader>
						<AlertDialogMedia className='rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
						</AlertDialogMedia>
						<AlertDialogTitle>Delete Base List?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the Base List and all its items. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							variant={'outline'}
							size={'sm'}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={loading}
							variant={'destructive'}
							size={'sm'}
							className='flex-1'
						>
							{loading ? (
								<>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										className='h-4 w-4 animate-spin'
									/>
									Deleting…
								</>
							) : (
								'Delete'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
