'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Upload06Icon } from '@hugeicons/core-free-icons'

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utils'

// Lazy load UploadTicketForm since it contains heavy FileReader and image processing
const UploadTicketForm = dynamic(
	() => import('./upload-ticket-form').then(mod => ({ default: mod.UploadTicketForm })),
	{
		ssr: false,
		loading: () => <div className='py-8 text-center text-sm text-muted-foreground'>Loading upload form...</div>,
	},
)

/** The default trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. */
interface Props extends Omit<ButtonProps, 'children'> {
	/** Text of the default trigger; "Upload Receipt" unless a surface asks for something more specific. */
	label?: string
	/**
	 * Replaces the default "Upload Receipt" button, for surfaces that open the dialog from their own control. `null` renders no
	 * trigger at all, for a surface that opens the dialog itself through `open`.
	 */
	trigger?: ReactNode
	/** Controls the dialog from outside (for example a drop target); without it the dialog manages itself. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Photos to start with, such as the ones dropped on the "Upload Another Receipt" tile. */
	initialFiles?: File[]
}

/** The upload form: a bottom sheet on phones and a centred dialog from `sm`. */
export function UploadTicketDialog({
	className,
	label = 'Upload Receipt',
	trigger,
	open: controlledOpen,
	onOpenChange,
	initialFiles,
	...buttonProps
}: Props = {}) {
	const [ownOpen, setOwnOpen] = useState(false)
	const router = useRouter()
	const open = controlledOpen ?? ownOpen
	const setOpen = onOpenChange ?? setOwnOpen

	const handleSuccess = () => {
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			{trigger === null ? null : (
				<DialogTrigger asChild>
					{trigger ?? (
						<Button
							size='primary'
							{...buttonProps}
							className={cn('w-full', className)}
						>
							<HugeiconsIcon
								icon={Upload06Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
							{label}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent
				hideClose
				sheetOnPhones
				data-testid='upload-ticket-dialog'
				onOpenAutoFocus={e => e.preventDefault()}
				variant='sheet'
				className='sm:max-w-[520px]'
			>
				<DialogHeader variant='sheet'>
					<DialogTitle variant='sheet'>
						Upload Receipt
					</DialogTitle>
					<DialogDescription variant='sheet'>
						Upload photos of your shopping receipt. We&apos;ll extract the items automatically.
					</DialogDescription>
					<DialogClose asChild>
						<Button
							aria-label='Close'
							variant='quiet'
							size='icon-xl'
							className='absolute -top-1.5 -right-2'
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								strokeWidth={1.8}
								className='size-5'
							/>
						</Button>
					</DialogClose>
				</DialogHeader>
				<UploadTicketForm
					onSuccess={handleSuccess}
					initialFiles={initialFiles}
				/>
			</DialogContent>
		</Dialog>
	)
}
