'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

import { CardFooterContent, CardHeaderContent } from '@/components/app'

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

	if (isActiveRun) return null

	if (editing) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
			>
				<Card
					variant='premium'
					className='border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/10'
					data-testid={`list-card-${baseList.id}`}
				>
					<CardHeader>
						<CardTitle className='font-bold'>Edit List</CardTitle>
					</CardHeader>
					<CardContent className='gap-2'>
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
								placeholder='Description or notes, eg. "Weekly groceries", "Items for camping trip", etc.'
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
					</CardContent>
				</Card>
			</motion.div>
		)
	}

	return (
		<>
			<Link href={`/base-lists/${baseList.id}/edit`}>
				<Card
					variant='premium'
					className='group relative flex h-full cursor-pointer flex-col bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 gap-0 py-4'
					data-testid={`list-card-${baseList.id}`}
				>
					<div className='flex items-center justify-end gap-1'>
						{!isActiveRun && (
							<div className='flex items-center justify-end gap-1 px-4'>
								<Button
									variant='ghost'
									size='icon'
									onClick={e => {
										e.preventDefault()
										e.stopPropagation()
										setEditing(true)
									}}
									disabled={loading}
									className='h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary'
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
									className='h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive'
									aria-label='Delete list'
								>
									<HugeiconsIcon
										icon={Delete02Icon}
										strokeWidth={2}
									/>
								</Button>
							</div>
						)}
					</div>

					<CardHeaderContent
						icon={ListViewIcon}
						title={baseList.name}
						description={baseListNotes ?? undefined}
					/>

					<CardFooterContent
						count={baseList.items_count}
						coutLabel={baseList.items_count === 1 ? 'Item' : 'Items'}
						linkText='View Items'
					/>
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
						<AlertDialogTitle className='truncate font-bold tracking-tight text-foreground'>
							Delete Base List?
						</AlertDialogTitle>
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
