'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { HugeiconsIcon } from '@hugeicons/react'
import { Upload06Icon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utils'
import { LoadingState, SheetDialog } from '@/components/commons'

// Lazy load UploadTicketForm since it contains heavy FileReader and image processing
const UploadTicketForm = dynamic(
	() => import('./upload-ticket-form').then(mod => ({ default: mod.UploadTicketForm })),
	{
		ssr: false,
		loading: () => (
			<LoadingState testId='upload-ticket-form-loading' label='Preparing receipt upload…' />
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
	// While photos are being sent the close control rests: the sheet stays open until the upload finishes.
	const [busy, setBusy] = useState(false)
	const router = useRouter()
	const open = controlledOpen ?? ownOpen
	const setOpen = onOpenChange ?? setOwnOpen

	const handleSuccess = () => {
		setOpen(false)
		router.refresh()
	}

	return (
		<SheetDialog
			open={open}
			onOpenChange={setOpen}
			busy={busy}
			testId='upload-ticket-dialog'
			title='Upload Receipt'
			description={<>Upload photos of your receipt. We read the <strong>store, date and total</strong>, and you confirm them before anything is saved.</>}
			trigger={trigger === null ? undefined : (
				trigger ?? (
					<Button
						size='lg'
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
				)
			)}
		>
			<div className='flex flex-col gap-4 py-1'>
				<UploadTicketForm
					onSuccess={handleSuccess}
					initialFiles={initialFiles}
					shoppingSessionId={shoppingSessionId}
					onBusyChange={setBusy}
				/>
			</div>
		</SheetDialog>
	)
}
