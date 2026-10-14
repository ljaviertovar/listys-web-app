'use client'

import type { ReactNode } from 'react'
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
}: SheetDialogProps) {
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
				data-testid={testId}
				onOpenAutoFocus={autoFocus ? undefined : e => e.preventDefault()}
				variant='sheet'
				className={cn('sm:max-w-[520px]', className)}
			>
				<DialogHeader className='relative gap-1 pr-12 text-left'>
					<DialogTitle variant='sheet'>
						{title}
					</DialogTitle>
					{description ? (
						<DialogDescription variant='sheet'>
							{description}
						</DialogDescription>
					) : (
						<DialogDescription className='sr-only'>{typeof title === 'string' ? title : 'Dialog'}</DialogDescription>
					)}
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
