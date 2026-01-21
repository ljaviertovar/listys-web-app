'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import { FolderIcon, Edit02Icon, Delete02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { deleteGroup } from '@/actions/ticket-groups'
import { EditGroupDialog } from './edit-group-dialog'

interface Group {
	id: string
	name: string
	description?: string | null
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
			<Card className='transition-colors hover:border-primary/50'>
				<CardHeader>
					<CardTitle className='flex items-center justify-between'>
						<span className='flex items-center gap-2'>
							<HugeiconsIcon
								icon={FolderIcon}
								strokeWidth={2}
							/>
							{group.name}
						</span>
						<div className='flex gap-1'>
							<Button
								variant='ghost'
								size='icon'
								onClick={e => {
									e.preventDefault()
									setShowEditDialog(true)
								}}
							>
								<HugeiconsIcon
									icon={Edit02Icon}
									strokeWidth={2}
								/>
							</Button>
							<Button
								variant='ghost'
								size='icon'
								onClick={e => {
									e.preventDefault()
									setShowDeleteDialog(true)
								}}
								disabled={deleting}
							>
								<HugeiconsIcon
									icon={Delete02Icon}
									strokeWidth={2}
								/>
							</Button>
						</div>
					</CardTitle>
					{group.description && <CardDescription>{group.description}</CardDescription>}
				</CardHeader>
				<CardContent>
					<Button
						variant='outline'
						className='w-full'
						asChild
					>
						<Link href={`/ticket-groups/${group.id}/lists`}>View Lists</Link>
					</Button>
				</CardContent>
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
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Group</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{group.name}"? This will also delete all base lists and shopping runs in
							this group. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleting}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
