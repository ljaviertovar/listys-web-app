'use client'

import type { ReactNode } from 'react'
import { useId } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RowIcon } from '@/components/commons/row-icon'
import { useDialogFocus } from '@/hooks'
import { WarningAlert } from '../warning-alert'

interface ConfirmSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: ReactNode
	/** Plain explanation under the title. */
	description?: ReactNode
	/** What the action costs, in a feedback panel. */
	consequence?: ReactNode
	/** Short heading that summarizes the consequence warning. */
	consequenceTitle?: ReactNode
	consequenceTone?: 'danger' | 'warning'
	/** Extra content between the explanation and the buttons, such as an option to tick. */
	children?: ReactNode
	/** Icon tile shown before the description; leave it out for a plain sheet. */
	media?: ReactNode
	cancelLabel?: string
	confirmLabel: string
	/** Label while `loading`; the confirm button keeps its width. */
	loadingLabel?: string
	/** `danger` is the red confirm of a destructive action; `primary` the blue one of a confirmation that is not. */
	tone?: 'danger' | 'primary'
	loading?: boolean
	onConfirm: () => void
	testId: string
}

/** Native confirmation actions inside the approved responsive sheet presentation. */
export function ConfirmSheet({
	open,
	onOpenChange,
	title,
	description,
	consequence,
	consequenceTitle,
	consequenceTone = 'danger',
	children,
	media,
	cancelLabel = 'Cancel',
	confirmLabel,
	loadingLabel,
	tone = 'primary',
	loading = false,
	onConfirm,
	testId,
}: ConfirmSheetProps) {
	const descriptionId = useId()
	const consequenceId = useId()
	const { onOpenAutoFocus, onCloseAutoFocus } = useDialogFocus()
	return (
		<AlertDialog
			open={open}
			onOpenChange={next => !loading && onOpenChange(next)}
		>
		<AlertDialogContent sheetOnPhones data-testid={testId} onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus} aria-describedby={[
				description ? descriptionId : null,
				consequence ? consequenceId : null,
			].filter(Boolean).join(' ') || undefined}
		>
			<AlertDialogHeader variant='sheet'>
				<AlertDialogTitle>{title}</AlertDialogTitle>
				{description && !media ? (
					<AlertDialogDescription id={descriptionId}>{description}</AlertDialogDescription>
				) : null}
			</AlertDialogHeader>
			<div className='flex flex-col gap-4'>
				{description && media ? (
					<div className='flex items-center gap-3.5'>
						{media}
						<AlertDialogDescription id={descriptionId}>{description}</AlertDialogDescription>
					</div>
				) : media ? media : null}
				{consequence ? consequenceTone === 'warning' ? (
					<WarningAlert id={consequenceId} role='note' testId={`${testId}-consequence-warning`}>
						<div className='flex min-w-0 flex-col gap-0.5'>
							{consequenceTitle ? <AlertTitle>{consequenceTitle}</AlertTitle> : null}
							<AlertDescription>{consequence}</AlertDescription>
						</div>
					</WarningAlert>
				) : (
					<Alert id={consequenceId} role='note' variant='destructive'>
						<RowIcon icon={AlertCircleIcon} tone='danger' size='alert' />
						<div className='flex min-w-0 flex-col gap-0.5'>
							{consequenceTitle ? <AlertTitle>{consequenceTitle}</AlertTitle> : null}
							<AlertDescription>{consequence}</AlertDescription>
						</div>
					</Alert>
				) : null}
				{children}
			</div>
			<AlertDialogFooter className='mt-4'>
				<AlertDialogCancel
					size='lg'
					type='button'
					variant='secondary'
					disabled={loading}
				>
					{cancelLabel}
				</AlertDialogCancel>
				<AlertDialogAction
					type='button'
					size='lg'
					variant={tone === 'danger' ? 'destructive' : 'default'}
					disabled={loading}
					onClick={event => {
						event.preventDefault()
						if (!loading) onConfirm()
					}}
					data-testid={`${testId}-confirm`}
				>
					{loading ? (
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 animate-spin motion-reduce:animate-none'
						/>
					) : null}
					{loading ? (loadingLabel ?? confirmLabel) : confirmLabel}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
		</AlertDialog>
	)
}
