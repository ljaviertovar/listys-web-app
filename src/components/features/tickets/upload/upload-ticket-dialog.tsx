'use client'

import { useRef, useState, type ReactNode } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDialogFocus } from '@/hooks'
import { cn } from '@/utils'

// Lazy load UploadTicketForm since it contains heavy FileReader and image processing
const UploadTicketForm = dynamic(
	() => import('./upload-ticket-form').then(mod => ({ default: mod.UploadTicketForm })),
	{
		ssr: false,
		loading: () => (
			<div
				role='status'
				aria-live='polite'
				data-testid='upload-ticket-form-loading'
				className='py-8 text-center text-sm text-muted-foreground'
			>
				Preparing receipt upload…
			</div>
		),
	},
)

/** The default trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. */
interface Props extends Omit<ButtonProps, 'children'> {
	/** Text of the default trigger; "Upload Receipt" unless a surface asks for something more specific. */
	label?: string
	/** Icon for the default trigger when a surface needs to describe attaching instead of uploading. */
	triggerIcon?: typeof Upload06Icon
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
	/** The trip this upload belongs to, set only by a trip's own receipts card; it is what lets the receipt be attached to that trip later. */
	shoppingSessionId?: string
}

/** The upload form: a bottom sheet on phones and a centred dialog from `sm`. */
export function UploadTicketDialog({
	className,
	label = 'Upload Receipt',
	triggerIcon = Upload06Icon,
	trigger,
	open: controlledOpen,
	onOpenChange,
	initialFiles,
	shoppingSessionId,
	...buttonProps
}: Props = {}) {
	const [ownOpen, setOwnOpen] = useState(false)
	// While photos are being sent the title centres and the close control rests: the sheet stays open until the upload finishes.
	const [busy, setBusy] = useState(false)
	const titleRef = useRef<HTMLHeadingElement>(null)
	const { onOpenAutoFocus, onCloseAutoFocus } = useDialogFocus(titleRef)
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
			onOpenChange={next => !busy && setOpen(next)}
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
								icon={triggerIcon}
								strokeWidth={1.8}
								className='size-4.5'
								aria-hidden='true'
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
				onOpenAutoFocus={onOpenAutoFocus}
				onCloseAutoFocus={onCloseAutoFocus}
				variant='sheet'
				className='sm:max-w-[520px]'
			>
				<DialogHeader
					variant='sheet'
					className='shrink-0'
				>
					<DialogTitle
						ref={titleRef}
						tabIndex={-1}
						variant='sheet'
						className={cn(busy && 'justify-center text-center')}
					>
						Upload Receipt
					</DialogTitle>
					<DialogDescription
						variant='sheet'
						className='sr-only'
					>
						Add photos of your receipt.
					</DialogDescription>
					<DialogClose asChild>
						<Button
							aria-label='Close'
							variant='quiet'
							size='icon-xl'
							disabled={busy}
							className='absolute top-0 -right-2 sm:-top-2.25'
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								strokeWidth={1.8}
								className='size-5'
							/>
						</Button>
					</DialogClose>
				</DialogHeader>
				<ScrollArea
					size='sheet-fit'
					scrollHint
					className='min-h-0 flex-none'
				>
					<div className='flex flex-col gap-4 py-1'>
						<UploadTicketForm
							onSuccess={handleSuccess}
							initialFiles={initialFiles}
							shoppingSessionId={shoppingSessionId}
							onBusyChange={setBusy}
						/>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
