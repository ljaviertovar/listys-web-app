'use client'

import { useState, type ComponentProps, type ReactNode } from 'react'
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
import { Button } from '@/components/ui/button'

// Lazy load UploadTicketForm since it contains heavy FileReader and image processing
const UploadTicketForm = dynamic(
	() => import('./upload-ticket-form').then(mod => ({ default: mod.UploadTicketForm })),
	{
		ssr: false,
		loading: () => <div className='py-8 text-center text-sm text-muted-foreground'>Loading upload form...</div>,
	},
)

interface Props {
	/** Lets a surface that already has a primary action demote this trigger to a secondary one. */
	variant?: ComponentProps<typeof Button>['variant']
	size?: ComponentProps<typeof Button>['size']
	className?: string
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
	variant,
	size,
	className,
	label = 'Upload Receipt',
	trigger,
	open: controlledOpen,
	onOpenChange,
	initialFiles,
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
							variant={variant}
							size={size}
							className={className ?? 'w-full'}
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
				className='gap-5 rounded-[28px] border-0 p-5 sm:max-w-[520px] sm:p-6 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]'
			>
				<DialogHeader className='relative gap-1 pr-12 text-left'>
					<DialogTitle className='font-display text-xl leading-[1.3] font-semibold tracking-[-0.015em] text-foreground'>
						Upload Receipt
					</DialogTitle>
					<DialogDescription className='text-sm leading-normal text-slate-500 dark:text-muted-foreground'>
						Upload photos of your shopping receipt. We&apos;ll extract the items automatically.
					</DialogDescription>
					<DialogClose
						aria-label='Close'
						className='absolute -top-1.5 -right-2 flex size-11 items-center justify-center rounded-[12px] text-slate-600 transition-colors hover:bg-[#E9ECF0] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:hover:bg-muted'
					>
						<HugeiconsIcon
							icon={Cancel01Icon}
							strokeWidth={1.8}
							className='size-5'
						/>
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
