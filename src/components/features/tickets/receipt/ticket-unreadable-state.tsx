import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Alert02Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Card } from '@/components/ui/card'

import { UploadTicketDialog } from '../upload/upload-ticket-dialog'
import { TicketActions } from './ticket-actions'

interface TicketUnreadableStateProps {
	ticketId: string
	/** `failed` is an error (nothing could be read); `no-items` is a warning (the receipt was read but no item lines were found). */
	kind: 'failed' | 'no-items'
}

const COPY = {
	failed: {
		title: 'We couldn’t read this receipt',
		help: 'The photo may be blurry, cropped or too dark. Nothing was saved.',
		tips: ['Lay the receipt flat and fill the frame', 'Use good light and turn the flash off', 'Take one photo per page for long receipts'],
	},
	'no-items': {
		title: 'No items detected',
		help: 'We found the store but no item lines. A clearer, flatter photo usually fixes it.',
		tips: ['Lay the receipt flat and smooth out the folds', 'Use even light, without shadows or glare', 'Fit the whole receipt in the frame'],
	},
} as const

/**
 * A receipt that gave nothing to review. Both cases share one structure (what happened, tips for a better photo, the same three
 * actions) and differ in tone: red for a read that failed, amber for a read that found no lines.
 */
export function TicketUnreadableState({ ticketId, kind }: TicketUnreadableStateProps) {
	const copy = COPY[kind]
	const failed = kind === 'failed'
	const titleId = `ticket-unreadable-title-${ticketId}`

	return (
		<div
			data-testid='ticket-unreadable-state'
			data-kind={kind}
			className='flex flex-col gap-4'
		>
			<Card
				size='notice'
				aria-labelledby={titleId}
				data-testid='ticket-unreadable-card'
			>
				<div className='flex items-start gap-3'>
					<RowIcon
						icon={failed ? AlertCircleIcon : Alert02Icon}
						tone={failed ? 'danger' : 'warning'}
						size='lg'
						testId='ticket-unreadable-icon'
					/>
					<div className='flex min-w-0 flex-1 flex-col gap-1'>
						<h2
							id={titleId}
							className='font-display text-base leading-[1.33] font-semibold tracking-[-0.015em]'
						>
							{copy.title}
						</h2>
						<p className='text-xs leading-[1.4] text-slate-500 dark:text-muted-foreground'>{copy.help}</p>
					</div>
				</div>
				<ul
					aria-label='Tips for a clearer photo'
					className='flex flex-col gap-2.5 rounded-2xl bg-muted p-3'
				>
					{copy.tips.map(tip => (
						<li
							key={tip}
							className='flex items-start gap-2.5 text-sm leading-[1.4] text-slate-700 dark:text-foreground/80'
						>
							<span className='mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-blue-700 dark:bg-muted dark:text-blue-300'>
								<HugeiconsIcon
									icon={Tick02Icon}
									strokeWidth={2}
									className='size-3.5'
								/>
							</span>
							{tip}
						</li>
					))}
				</ul>
			</Card>
			<div
				data-testid='ticket-unreadable-actions'
				className='flex flex-col gap-2'
			>
				<UploadTicketDialog
					label='Upload a Clearer Photo'
					className='w-full'
				/>
				<TicketActions
					ticket={{ id: ticketId, ocr_status: failed ? 'failed' : 'completed' }}
					allowRetry
					retryLabel='Try Again'
				/>
			</div>
		</div>
	)
}
