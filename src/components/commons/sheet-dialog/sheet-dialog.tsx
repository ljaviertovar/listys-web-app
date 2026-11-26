'use client'

import { Fragment, useId, useRef, type ComponentProps, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataFacts, type DataFact } from '../data-line/data-line'
import { useDialogFocus } from '@/hooks'
import { cn } from '@/utils'

/** The paper of every app sheet (`--background`) with its fields on the card white (`--card`), so a field reads as a field
 * without a dark outline. Scoped to the sheet, so the same inputs on the page keep their own fill. */
const SHEET_SURFACE =
	'bg-background [&_[data-slot=input]]:border-border [&_[data-slot=input]]:bg-card [&_[data-slot=textarea]]:border-border [&_[data-slot=textarea]]:bg-card [&_[data-slot=select-trigger]]:border-border [&_[data-slot=select-trigger]]:bg-card [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card [&_form]:gap-4'

interface SheetDialogProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** The control that opens the sheet. Omit it when the sheet is opened from outside through `open`. */
	trigger?: ReactNode
	/** What this is: an action or an object in Title Case, a question in sentence case. Two lines at most. */
	title: ReactNode
	/** A status next to the title, such as a `TicketStatusChip`. It never carries an action. */
	aside?: ReactNode
	/** One or two sentences under the title. Wrap the one phrase the user must check in a `<strong>`. */
	description?: ReactNode
	/** What the sheet is about: an entity label or a badge. Empty entries are skipped. */
	chips?: Array<ReactNode>
	/** At most three facts, in this order: quantity, time, amount. Empty entries are skipped. */
	facts?: Array<DataFact | null | false | undefined>
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
	nested?: ComponentProps<typeof AlertDialogContent>['nested']
	/** The body takes the height of its content (up to the usual limit), so a short sheet leaves no blank gap. Pass `false` to hold the fixed height. */
	fit?: boolean
	/** While saving or uploading the close control rests and the sheet cannot be dismissed. */
	busy?: boolean
}

/**
 * The form surface: a bottom sheet on phones and a centred dialog from `sm`. Its title and aside make up
 * the identity row, the description sits under it, and chips and the data line close the header. An empty slot renders nothing.
 */
export function SheetDialog({
	open,
	onOpenChange,
	trigger,
	title,
	aside,
	description,
	chips,
	facts,
	children,
	role = 'dialog',
	testId,
	className,
	autoFocus = false,
	descriptionId,
	ariaDescribedBy,
	nested,
	fit = true,
	busy = false,
}: SheetDialogProps) {
	const generatedDescriptionId = useId()
	const resolvedDescriptionId = descriptionId ?? generatedDescriptionId
	const titleRef = useRef<HTMLHeadingElement>(null)
	const { onOpenAutoFocus, onCloseAutoFocus } = useDialogFocus(titleRef, { autoFocus })
	const visibleChips = (chips ?? []).filter(Boolean)
	const visibleFacts = (facts ?? []).filter(Boolean)
	const hasMeta = visibleChips.length > 0 || visibleFacts.length > 0
	return (
		<AlertDialog
			open={open}
			onOpenChange={next => {
				if (!busy) onOpenChange?.(next)
			}}
		>
			{trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
			<AlertDialogContent
				sheetLayout='form'
				sheetOnPhones
				surface={SHEET_SURFACE}
				nested={nested}
				role={role}
				aria-describedby={ariaDescribedBy ?? (description ? resolvedDescriptionId : undefined)}
				data-testid={testId}
				onOpenAutoFocus={onOpenAutoFocus}
				onCloseAutoFocus={onCloseAutoFocus}
				onEscapeKeyDown={event => {
					// Let the nested Base UI popup consume Escape before dismissing this Radix sheet.
					if (event.target instanceof Element && event.target.closest('[role="combobox"][aria-expanded="true"]')) {
						event.preventDefault()
					}
				}}
				className={className}
			>
				<DialogHeader variant='sheet' className='shrink-0'>
					<div className='flex items-start justify-between gap-3'>
						<AlertDialogTitle ref={titleRef} tabIndex={-1} variant='sheet'>
							{title}
						</AlertDialogTitle>
						{/* A sibling of the title, so assistive tech reads the title without the status; mt-1 centres a 20px chip on the first 28px line. */}
						{aside ? <div className='mt-1 shrink-0'>{aside}</div> : null}
					</div>
					{description ? (
						<AlertDialogDescription id={resolvedDescriptionId} variant='sheet'>
							{description}
						</AlertDialogDescription>
					) : null}
					{hasMeta ? (
						<div
							data-testid={`${testId}-meta`}
							// 12px under a description, 8px under a bare title when chips lead, 4px when only the data line follows.
							className={cn('flex flex-col items-start gap-2', description ? 'mt-2' : visibleChips.length > 0 ? 'mt-1' : '')}
						>
							{visibleChips.length > 0 ? (
								<div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
									{visibleChips.map((chip, index) => (
										<Fragment key={index}>{chip}</Fragment>
									))}
								</div>
							) : null}
							{visibleFacts.length > 0 ? <DataFacts facts={visibleFacts} testId={`${testId}-data`} /> : null}
						</div>
					) : null}
					<AlertDialogCancel
						aria-label='Close'
						variant='ghost'
						size='icon-xl'
						disabled={busy}
						className='absolute -top-2 -right-2'
					>
						<HugeiconsIcon
							icon={Cancel01Icon}
							strokeWidth={1.8}
							className='size-5'
						/>
					</AlertDialogCancel>
				</DialogHeader>
				<ScrollArea size={fit ? 'sheet-fit' : 'sheet'} scrollHint className='min-h-0 flex-none'>{children}</ScrollArea>
			</AlertDialogContent>
		</AlertDialog>
	)
}
