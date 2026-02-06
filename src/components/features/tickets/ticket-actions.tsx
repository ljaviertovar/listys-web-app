'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'

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
import { Delete02Icon, Refresh04Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { deleteTicket, retryTicketOCR } from '@/actions/tickets'

import type { Ticket } from '@/features/tickets/types'

interface Props {
	ticket: Ticket
}

export function TicketActions({ ticket }: Props) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [retrying, setRetrying] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setDeleting(true)
		try {
			const { error } = await deleteTicket(ticket.id)
			if (error) {
				toast.error('Failed to delete receipt', {
					description: error,
				})
				return
			}
			toast.success('Receipt deleted successfully')
			router.push('/tickets')
		} catch (err) {
			console.error('Failed to delete ticket:', err)
			toast.error('Failed to delete receipt', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred',
			})
		} finally {
			setDeleting(false)
			setShowDeleteDialog(false)
		}
	}

	const handleRetry = async () => {
		setRetrying(true)
		try {
			const { error } = await retryTicketOCR(ticket.id)
			if (error) {
				toast.error('Failed to retry OCR', {
					description: error,
				})
				return
			}
			toast.success('OCR processing started', {
				description: 'The receipt is being reprocessed. This may take a few moments.',
			})
			router.refresh()
		} catch (err) {
			console.error('Failed to retry OCR:', err)
			toast.error('Failed to retry OCR', {
				description: err instanceof Error ? err.message : 'An unexpected error occurred',
			})
		} finally {
			setRetrying(false)
		}
	}

	// Show retry/reprocess button for failed or pending tickets (do NOT show while processing)
	const showRetryButton = ticket.ocr_status === 'failed' || ticket.ocr_status === 'pending'
	const retryButtonLabel = ticket.ocr_status === 'failed' ? 'Retry' : 'Reprocess'

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
							icon={Refresh04Icon}
							strokeWidth={2}
							className='mr-2 h-4 w-4'
						/>
					)}
					{retrying ? 'Processing...' : retryButtonLabel}
				</Button>
			)}

			{/* Hide delete while processing to avoid accidental removal during OCR */}
			{ticket.ocr_status !== 'processing' && (
				<Button
					variant='destructive'
					size='sm'
					onClick={() => setShowDeleteDialog(true)}
				>
					<HugeiconsIcon
						icon={Delete02Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Delete Receipt
				</Button>
			)}

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
						<AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the receipt image and all extracted items. This action cannot be undone.
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
		</div>
	)
}
