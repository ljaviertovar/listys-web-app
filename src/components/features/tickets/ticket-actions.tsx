'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Delete02Icon, RefreshIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { deleteTicket, retryTicketOCR } from '@/actions/tickets'

interface Props {
	ticketId: string
	status: string
}

export function TicketActions({ ticketId, status }: Props) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [retrying, setRetrying] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setDeleting(true)
		try {
			const { error } = await deleteTicket(ticketId)
			if (error) throw new Error(error)
			router.push('/tickets')
		} catch (err) {
			console.error('Failed to delete ticket:', err)
			setDeleting(false)
			setShowDeleteDialog(false)
		}
	}

	const handleRetry = async () => {
		setRetrying(true)
		try {
			const { error } = await retryTicketOCR(ticketId)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			console.error('Failed to retry OCR:', err)
		} finally {
			setRetrying(false)
		}
	}

	// Show retry/reprocess button for failed, stuck pending, or stuck processing tickets
	const showRetryButton = status === 'failed' || status === 'pending' || status === 'processing'
	const retryButtonLabel = status === 'failed' ? 'Retry OCR' : 'Reprocess'

	return (
		<div className='flex items-center gap-2'>
			{showRetryButton && (
				<Button
					variant='outline'
					size='sm'
					onClick={handleRetry}
					disabled={retrying}
				>
					{retrying ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='mr-2 h-4 w-4 animate-spin'
						/>
					) : (
						<HugeiconsIcon
							icon={RefreshIcon}
							strokeWidth={2}
							className='mr-2 h-4 w-4'
						/>
					)}
					{retrying ? 'Processing...' : retryButtonLabel}
				</Button>
			)}

			<Button
				variant='outline'
				size='sm'
				onClick={() => setShowDeleteDialog(true)}
				className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
			>
				<HugeiconsIcon
					icon={Delete02Icon}
					strokeWidth={2}
					className='mr-2 h-4 w-4'
				/>
				Delete
			</Button>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Ticket</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this ticket? This will remove the receipt image and all extracted items.
							This action cannot be undone.
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
		</div>
	)
}
