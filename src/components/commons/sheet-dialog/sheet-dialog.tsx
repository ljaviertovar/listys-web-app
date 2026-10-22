'use client'

import { useRef, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

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
import { useDialogFocus } from '@/hooks'
import { cn } from '@/utils'

interface SheetDialogProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** The control that opens the sheet. Omit it when the sheet is opened from outside through `open`. */
	trigger?: ReactNode
	title: ReactNode
	description?: ReactNode
	children: ReactNode
	/** `alertdialog` for a confirmation the user has to answer, so assistive tech announces it that way. */
	role?: 'dialog' | 'alertdialog'
	/** Identifies the sheet in browser inspection and tests; the caller says what it holds. */
	testId: string
	className?: string
	/** Lets a form focus its first field itself; by default nothing is focused so a phone keyboard does not jump up. */
	autoFocus?: boolean
	descriptionId?: string
	ariaDescribedBy?: string
}

/**
 * The A1 form surface: a bottom sheet on phones and a centred dialog from `sm`, with its title on the left and a 44px
 * close control. Every create, edit, share and confirm flow of the app opens in this one shell.
 */
export function SheetDialog({
	open,
	onOpenChange,
	trigger,
	title,
	description,
	children,
	role = 'dialog',
	testId,
	className,
	autoFocus = false,
	descriptionId,
	ariaDescribedBy,
}: SheetDialogProps) {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const { onOpenAutoFocus, onCloseAutoFocus } = useDialogFocus(titleRef, { autoFocus })
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent
				hideClose
				sheetOnPhones
				role={role}
				aria-describedby={ariaDescribedBy}
				data-testid={testId}
				onOpenAutoFocus={onOpenAutoFocus}
				onCloseAutoFocus={onCloseAutoFocus}
				variant='sheet'
				className={cn('sm:max-w-[520px]', className)}
			>
				<DialogHeader variant='sheet'>
					<DialogTitle ref={titleRef} tabIndex={-1} variant='sheet'>
						{title}
					</DialogTitle>
					{description ? (
						<DialogDescription id={descriptionId} variant='sheet'>
							{description}
						</DialogDescription>
					) : null}
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
				{children}
			</DialogContent>
		</Dialog>
	)
}
