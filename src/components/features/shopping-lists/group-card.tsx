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
				variant='premium'
				className='border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/10'
			>
				<CardHeader>
					<CardTitle className='text-lg font-bold'>Edit Group</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(handleUpdate)}
						className='space-y-3'
					>
						<Input
							{...register('name')}
							placeholder='Group name'
							className='bg-muted/30 focus-visible:ring-primary'
							aria-invalid={!!errors.name}
							disabled={loading}
							required
						/>
						<Textarea
							{...register('description')}
							placeholder='Description...'
							className='h-20 resize-none bg-muted/30 focus-visible:ring-primary text-xs'
							disabled={loading}
						/>
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
				className='group relative flex h-full cursor-pointer flex-col bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 gap-0 py-4'
			>
				{/* Always Visible Actions (Mobile First) */}
				{!history && (
					<div className='flex items-center justify-end gap-1 px-4'>
						<Button
							variant='ghost'
							size='icon'
							onClick={e => {
								e.preventDefault()
								e.stopPropagation()
								reset({
									name: group.name,
									description: group.description ?? '',
								})
								setEditing(true)
							}}
							className='h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary'
							aria-label='Edit group'
						>
							<HugeiconsIcon
								icon={Edit02Icon}
								strokeWidth={1.5}
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
							className='h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive'
							aria-label='Delete group'
						>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={1.5}
								className='h-4 w-4'
							/>
						</Button>
					</div>
				)}

				<Link
					href={history ? `/shopping-history/${group.id}` : `/shopping-lists/${group.id}/lists`}
					className='flex h-full flex-col'
				>
					<CardHeaderContent
						icon={FolderIcon}
						title={group.name}
						description={group.description ?? undefined}
					/>

					<CardContent className='mt-auto px-4'>
						<div className='flex items-center justify-between border-t border-border/40 pt-2'>
							<div className='flex items-baseline gap-1'>
								<span className='text-lg font-bold text-foreground tabular-nums tracking-tight'>
									{history ? (group.completed_runs_count ?? 0) : (group.base_lists?.[0]?.count ?? 0)}
								</span>
								<span className='text-xs font-bold uppercase tracking-widest text-primary/60'>
									{history ? 'Sessions' : 'Lists'}
								</span>
							</div>

							<div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary'>
								<span>View details</span>
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									strokeWidth={2.5}
									className='h-3 w-3 transition-transform group-hover:translate-x-0.5'
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
						<AlertDialogMedia className='rounded-xl bg-destructive/5 text-destructive border border-destructive/10'>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={2}
								className='h-5 w-5'
							/>
						</AlertDialogMedia>
						<AlertDialogTitle className='truncate font-bold tracking-tight text-foreground'>
							Delete Group?
						</AlertDialogTitle>
						<AlertDialogDescription className='text-xs'>
							This will delete <strong>"{group.name}"</strong> and its data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant='outline'>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleting}
							variant='destructive'
							className='flex-1'
						>
							Delete Group
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
