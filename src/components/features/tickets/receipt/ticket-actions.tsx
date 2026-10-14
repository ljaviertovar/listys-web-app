'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Refresh04Icon, Loading03Icon } from '@hugeicons/core-free-icons'

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
import { deleteTicket, retryTicketOCR } from '@/lib/api/endpoints'
import type { Ticket } from '@/types'

interface Props {
	ticket: Ticket
	/** A receipt that finished without items can be read again too: it shows "Try Again" like a failed one shows "Retry". */
	allowRetry?: boolean
}

export function TicketActions({ ticket, allowRetry = false }: Props) {
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
	const showRetryButton = ticket.ocr_status === 'failed' || ticket.ocr_status === 'pending' || allowRetry
	const retryButtonLabel = allowRetry ? 'Try Again' : ticket.ocr_status === 'failed' ? 'Retry' : 'Reprocess'

	// For stuck tickets in processing state, show delete button with a warning
	// (ocr_attempts will be set by the auto-fail function if truly stuck)
	const isStuckProcessing = ticket.ocr_status === 'processing' && ((ticket as Ticket & { ocr_attempts?: number | null }).ocr_attempts ?? 0) >= 2 // If 2+ attempts and still processing, likely stuck

	const deleteWarningMessage = isStuckProcessing
		? 'This receipt appears to be stuck in processing. You can delete it and try uploading again with a clearer photo.'
		: 'This will remove the receipt image and all extracted items. This action cannot be undone.'

	return (
		<div
			data-testid='ticket-actions'
			className='flex w-full flex-col gap-2'
		>
			{showRetryButton && (
				<Button
					variant='secondary'
					size='xl'
					onClick={handleRetry}
					disabled={retrying}
					className='w-full'
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
					{retrying ? 'Processing…' : retryButtonLabel}
				</Button>
			)}

			{/* Allow delete for failed/completed tickets, and stuck processing tickets */}
			{(ticket.ocr_status !== 'processing' || isStuckProcessing) && (
				<Button
					variant='destructive-soft'
					size='xl'
					onClick={() => setShowDeleteDialog(true)}
					className='w-full'
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
						<AlertDialogMedia tone='destructive'>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
						</AlertDialogMedia>
						<AlertDialogTitle variant='strong' className='truncate'>
							Delete Receipt?
						</AlertDialogTitle>
						<AlertDialogDescription>{deleteWarningMessage}</AlertDialogDescription>
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
		</div>
	)
}
