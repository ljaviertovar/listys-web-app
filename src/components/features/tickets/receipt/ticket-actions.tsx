'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Refresh04Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { retryTicketOCR } from '@/lib/api/endpoints'
import type { Ticket } from '@/types'
import { DeleteReceiptButton } from './delete-receipt-button'

interface Props {
	ticket: Pick<Ticket, 'id' | 'ocr_status'> & { ocr_attempts?: number | null }
	/** A receipt that finished without items can be read again too. */
	allowRetry?: boolean
	returnHref?: string
	onRetrySuccess?: () => void
	onDeleted?: () => void
}

export function TicketActions({ ticket, allowRetry = false, returnHref, onRetrySuccess, onDeleted }: Props) {
	const [retrying, setRetrying] = useState(false)
	const router = useRouter()

	const handleRetry = async () => {
		setRetrying(true)
		try {
			const { error } = await retryTicketOCR(ticket.id)
			if (error) {
				toast.error('Could not read receipt again', {
					description: 'Check your connection and try again.',
				})
				return
			}
			toast.success('Reading receipt again')
			onRetrySuccess?.()
			router.refresh()
		} catch (err) {
			console.error('Failed to retry OCR:', err)
			toast.error('Could not read receipt again', {
				description: 'Check your connection and try again.',
			})
		} finally {
			setRetrying(false)
		}
	}

	// Allow a new read for failed or pending tickets (do NOT show while processing).
	const showRetryButton = ticket.ocr_status === 'failed' || ticket.ocr_status === 'pending' || allowRetry
	const retryButtonLabel = 'Read Receipt Again'

	// For stuck tickets in processing state, show delete button with a warning
	// (ocr_attempts will be set by the auto-fail function if truly stuck)
	const isStuckProcessing = ticket.ocr_status === 'processing' && (ticket.ocr_attempts ?? 0) >= 2 // If 2+ attempts and still processing, likely stuck

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
					size='primary'
					onClick={handleRetry}
					disabled={retrying}
					className='w-full'
				>
					{retrying ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='mr-2 h-4 w-4 animate-spin motion-reduce:animate-none'
						/>
					) : (
						<HugeiconsIcon
							icon={Refresh04Icon}
							strokeWidth={2}
							className='mr-2 h-4 w-4'
						/>
					)}
					{retrying ? 'Starting…' : retryButtonLabel}
				</Button>
			)}

			{/* Allow delete for failed/completed tickets, and stuck processing tickets */}
			{(ticket.ocr_status !== 'processing' || isStuckProcessing) && <DeleteReceiptButton ticketId={ticket.id} returnHref={returnHref} onDeleted={onDeleted} warning={deleteWarningMessage} />}
		</div>
	)
}
