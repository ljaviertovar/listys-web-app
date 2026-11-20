'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { SheetDialog, WarningAlert } from '@/components/commons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { deleteTicket } from '@/lib/api/endpoints'

const DEFAULT_WARNING = 'This will remove the receipt image and all extracted items. This action cannot be undone.'

export function DeleteReceiptButton({
	ticketId,
	warning = DEFAULT_WARNING,
	saved = false,
}: {
	ticketId: string
	warning?: string
	/** The receipt's items already went into a list: deleting it leaves them there, and the sheet says so. */
	saved?: boolean
}) {
	const [open, setOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [deleteError, setDeleteError] = useState<string | null>(null)
	const router = useRouter()
	const [warningTitle, ...warningRest] = saved
		? ['Items already saved to your list from this receipt stay there', 'Only the receipt and its photos are deleted.']
		: warning.split(/(?<=\.)\s+/)

	const handleDelete = async () => {
		if (deleting) return
		setDeleting(true)
		setDeleteError(null)
		try {
			const { error } = await deleteTicket(ticketId)
			if (error) throw new Error(error)
			toast.success('Receipt deleted')
			router.push('/tickets')
			router.refresh()
		} catch {
			setDeleteError('Could not delete receipt. Check your connection and try again.')
			toast.error('Could not delete receipt', { description: 'Check your connection and try again.' })
			setDeleting(false)
		}
	}

	return (
		<div data-testid='delete-receipt-action'>
			<Button
				type='button'
				variant='destructiveGhost'
				size='lg'
				onClick={() => setOpen(true)}
				className='w-full'
			>
				<HugeiconsIcon
					icon={Delete02Icon}
					strokeWidth={1.5}
					className='size-4.5'
				/>
				Delete Receipt
			</Button>
			<SheetDialog
				open={open}
				onOpenChange={next => {
					if (!deleting) {
						setOpen(next)
						if (!next) setDeleteError(null)
					}
				}}
				title='Delete this receipt?'
				role='alertdialog'
				testId='delete-receipt-sheet'
				fit
				busy={deleting}
			>
				<div className='flex flex-col gap-4'>
					<WarningAlert
						role='note'
						testId='delete-warning'
						iconTestId='delete-warning-icon'
					>
						<AlertTitle>{warningTitle}</AlertTitle>
						{warningRest.length > 0 ? <AlertDescription>{warningRest.join(' ')}</AlertDescription> : null}
					</WarningAlert>
					{deleteError ? (
						<Alert
							variant='destructive'
							data-testid='delete-receipt-error'
						>
							<AlertTitle>Deletion failed</AlertTitle>
							<AlertDescription>{deleteError}</AlertDescription>
						</Alert>
					) : null}
					<div className='flex flex-col gap-2'>
						<Button
							type='button'
							variant='destructive'
							size='lg'
							disabled={deleting}
							onClick={() => void handleDelete()}
							data-testid='delete-receipt-confirm'
						>
							{deleting ? (
								<>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={1.5}
										className='size-4.5 animate-spin motion-reduce:animate-none'
									/>
									Deleting…
								</>
							) : (
								<>
									<HugeiconsIcon
										icon={Delete02Icon}
										strokeWidth={1.5}
										className='size-4.5'
									/>
									Delete Receipt
								</>
							)}
						</Button>
						<Button
							type='button'
							variant='outline'
							size='lg'
							disabled={deleting}
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			</SheetDialog>
		</div>
	)
}
