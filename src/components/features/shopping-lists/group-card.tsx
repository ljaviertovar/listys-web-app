'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { FolderIcon, Edit02Icon, Delete02Icon, ArrowRight01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { deleteGroup, updateGroup } from '@/actions/shopping-lists'
import { Separator } from '@/components/ui/separator'
import { CardHeaderContent } from '@/components/app'

interface Group {
	id: string
	name: string
	description?: string | null
	base_lists?: Array<{ id?: string; count?: number }>
	total_items?: number
	completed_runs_count?: number
}

interface Props {
	group: Group
	history?: boolean
}

export function GroupCard({ group, history = false }: Props) {
	const [editing, setEditing] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const schema = z.object({
		name: z.string().min(1, 'Name is required').max(100),
		description: z.string().max(500).optional(),
	})

	type FormData = z.infer<typeof schema>

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { name: group.name, description: group.description ?? '' },
	})

	const watchedName = watch('name')

	const handleUpdate = async (data: FormData) => {
		setLoading(true)
		try {
			const { error } = await updateGroup(group.id, data)
			if (error) throw new Error(error)
			setEditing(false)
			router.refresh()
			toast.success('Group updated')
		} catch (err) {
			console.error('Failed to update group:', err)
			const msg = err instanceof Error ? err.message : 'Failed to update group'
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	const handleCancel = () => {
		reset({ name: group.name, description: group.description ?? '' })
		setEditing(false)
	}

	const handleDelete = async () => {
		setDeleting(true)
		try {
			const { error } = await deleteGroup(group.id)
			if (error) throw new Error(error)
			router.refresh()
			toast.success('Group deleted')
		} catch (err) {
			console.error('Failed to delete group:', err)
			const msg = err instanceof Error ? err.message : 'Failed to delete group'
			toast.error(msg)
		} finally {
			setDeleting(false)
			setShowDeleteDialog(false)
		}
	}

	if (editing) {
		return (
			<Card
				size='sm'
				variant='premium'
				className='transition-colors'
			>
				<CardContent className='flex flex-col gap-2'>
					<form
						onSubmit={handleSubmit(handleUpdate)}
						className='space-y-3'
					>
						<div>
							<Input
								{...register('name')}
								placeholder='Group name'
								className='bg-card text-base'
								aria-invalid={!!errors.name}
								disabled={loading}
								required
							/>
							{errors.name && <p className='text-xs text-destructive mt-1'>{errors.name.message}</p>}
						</div>

						<div>
							<Textarea
								{...register('description')}
								placeholder='Description or notes, eg. "Lists related to grocery shopping", "Lists for camping trips", etc.'
								className='bg-card h-20 resize-none'
								disabled={loading}
							/>
							{errors.description && <p className='text-xs text-destructive mt-1'>{errors.description.message}</p>}
						</div>

						<div className='flex items-center justify-end gap-2'>
							<Button
								size='sm'
								variant='outline'
								onClick={handleCancel}
								disabled={loading}
								type='button'
							>
								Cancel
							</Button>
							<Button
								size='sm'
								type='submit'
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
		)
	}

	return (
		<>
			<Card
				variant='premium'
				size='sm'
				className='hover:bg-primary/1 hover:border-primary/50 transition-all cursor-pointer group'
			>
				<Link
					href={history ? `/shopping-history/${group.id}` : `/shopping-lists/${group.id}/lists`}
					data-testid={`group-card-${group.id}`}
				>
					<CardHeader className='gap-0'>
						{!history && (
							<div className='flex items-center justify-end gap-1'>
								<Button
									variant='ghost'
									size='icon'
									onClick={e => {
										e.preventDefault()
										e.stopPropagation()
										reset({ name: group.name, description: group.description ?? '' })
										setEditing(true)
									}}
									className='h-8 w-8'
									aria-label='Edit group'
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
									disabled={deleting}
									className='h-8 w-8'
									aria-label='Delete group'
								>
									<HugeiconsIcon
										icon={Delete02Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
								</Button>
							</div>
						)}

						<CardHeaderContent
							icon={FolderIcon}
							title={group.name}
							description={group.description ?? ''}
						/>
					</CardHeader>
					<CardContent className='pt-4'>
						<div className='flex items-center justify-between'>
							<span>
								{history
									? `${group.completed_runs_count ?? 0} ${(group.completed_runs_count ?? 0) === 1 ? 'Shopping' : 'Shoppings'}`
									: `${group.base_lists?.[0]?.count ?? 0} ${(group.base_lists?.[0]?.count ?? 0) === 1 ? 'list' : 'lists'}`}
							</span>
							<div className='flex items-center text-sm text-primary transition-colors'>
								<span>{history ? 'View history' : 'View lists'}</span>
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									strokeWidth={2}
									className='h-4 w-4 transition-transform group-hover:translate-x-1'
								/>
							</div>
						</div>
					</CardContent>
				</Link>
			</Card>

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
						<AlertDialogTitle>Delete Group?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete "{group.name}" and all its base lists and shopping sessions. This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant={'outline'}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleting}
							variant={'destructive'}
							className='flex-1'
						>
							{deleting ? (
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
