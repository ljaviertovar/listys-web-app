'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
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

import { Upload06Icon } from '@hugeicons/core-free-icons'

// Lazy load UploadTicketForm since it contains heavy FileReader and image processing
const UploadTicketForm = dynamic(
	() => import('./upload-ticket-form').then(mod => ({ default: mod.UploadTicketForm })),
	{
		ssr: false,
		loading: () => <div className='py-8 text-center text-sm text-muted-foreground'>Loading upload form...</div>,
	},
)

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
					Upload Receipt
				</Button>
			</DialogTrigger>
			<DialogContent
				onOpenAutoFocus={e => e.preventDefault()}
				className='w-11/12 sm:max-w-125'
			>
				<DialogHeader>
					<DialogTitle>Upload Receipt</DialogTitle>
					<DialogDescription>
						Upload photos of your shopping receipt. We'll extract the items automatically.
					</DialogDescription>
				</DialogHeader>
				<UploadTicketForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	)
}
