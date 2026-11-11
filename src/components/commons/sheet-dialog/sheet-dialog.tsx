'use client'

import { useRef, type ComponentProps, type ReactNode } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDialogFocus } from '@/hooks'
import { cn } from '@/utils'

interface SheetDialogProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** The control that opens the sheet. Omit it when the sheet is opened from outside through `open`. */
	trigger?: ReactNode
	title: ReactNode
	description?: ReactNode
	/** `body` sets the description as the 14px lead-in sentence of the sheet instead of the caption under a title. */
	descriptionVariant?: 'sheet' | 'body'
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
	nested?: ComponentProps<typeof DialogContent>['nested']
	/** The body takes the height of its content (up to the usual limit), so a short sheet leaves no blank gap. Pass `false` to hold the fixed height. */
	fit?: boolean
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
	descriptionVariant = 'sheet',
	children,
	role = 'dialog',
	testId,
	className,
	autoFocus = false,
	descriptionId,
	ariaDescribedBy,
	nested,
	fit = true,
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
				nested={nested}
				role={role}
				aria-describedby={ariaDescribedBy}
				data-testid={testId}
				onOpenAutoFocus={onOpenAutoFocus}
				onCloseAutoFocus={onCloseAutoFocus}
				variant='sheet'
				className={cn('sm:max-w-[520px]', className)}
			>
				<DialogHeader variant='sheet' className='shrink-0'>
					<DialogTitle ref={titleRef} tabIndex={-1} variant='sheet'>
						{title}
					</DialogTitle>
					{description ? (
						<DialogDescription id={descriptionId} variant={descriptionVariant}>
							{description}
						</DialogDescription>
					) : null}
					<DialogClose asChild>
						<Button
							aria-label='Close'
							variant='quiet'
							size='icon-xl'
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
				<ScrollArea size={fit ? 'sheet-fit' : 'sheet'} scrollHint className='min-h-0 flex-none'>{children}</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
