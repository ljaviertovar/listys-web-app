'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { deleteTicket } from '@/lib/api/endpoints'

export function DeleteReceiptButton({ ticketId, returnHref = '/tickets', onDeleted, warning = 'This will remove the receipt image and all extracted items. This action cannot be undone.' }: {
	ticketId: string
	returnHref?: string
	onDeleted?: () => void
	warning?: string
}) {
	const [open, setOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		if (deleting) return
		setDeleting(true)
		try {
			const { error } = await deleteTicket(ticketId)
			if (error) throw new Error(error)
			toast.success('Receipt deleted')
			setOpen(false)
			onDeleted?.()
			router.push(returnHref)
			router.refresh()
		} catch {
			toast.error('Could not delete receipt', { description: 'Check your connection and try again.' })
		} finally {
			setDeleting(false)
		}
	}

	return <div data-testid='delete-receipt-action'>
		<Button type='button' variant='destructive-soft' size='primary' onClick={() => setOpen(true)} className='w-full'>
			<HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className='size-4' />Delete Receipt
		</Button>
		<AlertDialog open={open} onOpenChange={next => { if (!deleting) setOpen(next) }}>
			<AlertDialogContent size='sm'>
				<AlertDialogHeader>
					<AlertDialogMedia tone='destructive'><HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className='size-4' /></AlertDialogMedia>
					<AlertDialogTitle variant='strong'>Delete Receipt?</AlertDialogTitle>
					<AlertDialogDescription>{warning}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant='outline' disabled={deleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction variant='destructive' disabled={deleting} onClick={event => { event.preventDefault(); void handleDelete() }} className='flex-1'>
						{deleting ? <><HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className='size-4 animate-spin' />Deleting…</> : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</div>
}
