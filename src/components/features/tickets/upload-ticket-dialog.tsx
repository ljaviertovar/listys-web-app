'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { CloudUploadIcon } from '@hugeicons/core-free-icons'
import { UploadTicketForm } from './upload-ticket-form'

export function UploadTicketDialog() {
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const handleSuccess = () => {
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button>
					<HugeiconsIcon
						icon={CloudUploadIcon}
						strokeWidth={2}
						className='mr-2 h-4 w-4'
					/>
					Upload Ticket
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Upload Receipt</DialogTitle>
					<DialogDescription>
						Upload a photo of your shopping receipt. We'll extract the items automatically.
					</DialogDescription>
				</DialogHeader>
				<UploadTicketForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	)
}
