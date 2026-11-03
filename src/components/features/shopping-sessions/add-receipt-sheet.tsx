'use client'

import { Button } from '@/components/ui/button'
import { SheetDialog } from '@/components/commons'

interface AddReceiptSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onUploadNew: () => void
	onChooseUploaded: () => void
}

/** The two ways to give a trip its receipt: take a photo of a new one, or use one that is already uploaded. */
export function AddReceiptSheet({ open, onOpenChange, onUploadNew, onChooseUploaded }: AddReceiptSheetProps) {
	return (
		<SheetDialog
			open={open}
			onOpenChange={onOpenChange}
			title='Add Receipt'
			description='Upload a new receipt or use one you already uploaded. You review it before anything changes.'
			testId='add-receipt-sheet'
		>
			<div className='flex flex-col gap-2'>
				<Button type='button' size='primary' onClick={onUploadNew}>Upload New Receipt</Button>
				<Button type='button' variant='secondary' size='primary' onClick={onChooseUploaded}>Choose Uploaded Receipt</Button>
			</div>
		</SheetDialog>
	)
}
