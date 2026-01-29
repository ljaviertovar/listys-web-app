'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { EditGroupDialog } from './edit-group-dialog'

import { FolderIcon, Edit02Icon, Delete02Icon, ArrowRight01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { deleteGroup } from '@/actions/shopping-lists'

interface Group {
	id: string
	name: string
	description?: string | null
	base_lists?: Array<{ count: number }>
}

interface Props {
	group: Group
}

export function GroupCard({ group }: Props) {
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setDeleting(true)
		try {
			const { error } = await deleteGroup(group.id)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			console.error('Failed to delete group:', err)
		} finally {
			setDeleting(false)
			setShowDeleteDialog(false)
		}
	}

	return (
		<>
			<Card className='hover:border-primary/50 transition-colors cursor-pointer group'>
				<Link href={`/shopping-lists/${group.id}/lists`}>
					<CardHeader className='gap-0'>
						<div className='flex items-center justify-end gap-1'>
							<Button
								variant='ghost'
								size='icon'
								onClick={e => {
									e.preventDefault()
									e.stopPropagation()
									setShowEditDialog(true)
								}}
								className='h-8 w-8'
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
							>
								<HugeiconsIcon
									icon={Delete02Icon}
									strokeWidth={2}
									className='h-4 w-4'
								/>
							</Button>
						</div>
						<div className='flex gap-2 items-center'>
							<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-full'>
								<HugeiconsIcon
									icon={FolderIcon}
									strokeWidth={2}
									className='h-6 w-6 text-primary'
								/>
							</span>
							<div className='flex flex-col'>
								<CardTitle className='text-lg truncate w-full max-w-[20ch]'>{group.name}</CardTitle>
								{group.description && <CardDescription className='text-xs'>{group.description}</CardDescription>}
							</div>
						</div>
					</CardHeader>
					<CardContent className='pt-4'>
						<div className='flex items-center justify-between'>
							<span className='text-primary font-medium'>
								{group.base_lists?.[0]?.count ?? 0} {(group.base_lists?.[0]?.count ?? 0) === 1 ? 'list' : 'lists'}
							</span>
							<div className='flex items-center text-sm group-hover:text-primary transition-colors'>
								<span>View lists</span>
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

			<EditGroupDialog
				group={group}
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
			/>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent size='sm'>
					<AlertDialogHeader>
						<AlertDialogMedia className='bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
						</AlertDialogMedia>
						<AlertDialogTitle>Delete Group?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete "{group.name}" and all its base lists and shopping runs. This action cannot be undone.
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
									Deleting...
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
