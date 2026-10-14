'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

import { SheetDialog } from './sheet-dialog'

interface ConfirmSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: ReactNode
	/** Plain explanation under the title. */
	description?: ReactNode
	/** What the action costs, in a red box: a destructive confirm names its consequences here. */
	consequence?: ReactNode
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

/** A two-button confirmation as an A1 sheet: Cancel on the left, the confirm on the right, both 48px tall. */
export function ConfirmSheet({
	open,
	onOpenChange,
	title,
	description,
	consequence,
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
	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !loading && onOpenChange(next)}
			title={title}
			role='alertdialog'
			testId={testId}
		>
			<div className='flex flex-col gap-4'>
				{description || media ? (
					<div className='flex items-center gap-3.5'>
						{media}
						{description ? (
							<p className='text-sm leading-normal text-slate-600 dark:text-muted-foreground'>{description}</p>
						) : null}
					</div>
				) : null}
				{consequence ? (
					<div
						role='note'
						className='flex items-start gap-3 rounded-2xl bg-red-50 px-3.5 py-3 text-sm leading-normal text-red-900 dark:bg-red-950/40 dark:text-red-200'
					>
						<HugeiconsIcon
							icon={AlertCircleIcon}
							strokeWidth={1.6}
							aria-hidden='true'
							className='mt-px size-5 shrink-0'
						/>
						<span>{consequence}</span>
					</div>
				) : null}
				{children}
			</div>
			<div className='grid grid-cols-2 gap-3'>
				<Button
					size='xl'
					type='button'
					variant='secondary'
					disabled={loading}
					onClick={() => onOpenChange(false)}
				>
					{cancelLabel}
				</Button>
				<Button
					type='button'
					size='xl'
					variant={tone === 'danger' ? 'destructive' : 'default'}
					disabled={loading}
					onClick={onConfirm}
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
				</Button>
			</div>
		</SheetDialog>
	)
}
