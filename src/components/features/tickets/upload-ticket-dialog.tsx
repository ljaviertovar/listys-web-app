'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadTicketForm } from './upload-ticket-form'

import { Upload06Icon } from '@hugeicons/core-free-icons'

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
				<Button className='w-full'>
					<HugeiconsIcon
						icon={Upload06Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Upload Ticket
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-125'>
				<DialogHeader>
					<DialogTitle>Upload Ticket</DialogTitle>
					<DialogDescription>
						Upload a photo of your shopping ticket. We'll extract the items automatically.
					</DialogDescription>
				</DialogHeader>
				<UploadTicketForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	)
}
