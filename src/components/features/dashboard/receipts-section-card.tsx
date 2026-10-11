import { Fragment } from 'react'
import { CancelCircleIcon, CheckmarkCircle02Icon, Clock01Icon, Invoice01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { UploadTicketDialog } from '@/components/features/tickets'
import { cn } from '@/utils'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { RowIcon } from './row-icon'
import type { ReceiptPreview } from './helpers/build-dashboard-model'
import { EMPTY_STATE_ACTION } from './helpers/dashboard-styles'

// Each state has an icon and a word as well as a colour, so colour is never the only cue.
const STATUS: Record<ReceiptPreview['status'], { label: string; icon: IconSvgElement; className: string }> = {
	completed: { label: 'Completed', icon: CheckmarkCircle02Icon, className: 'text-green-700 dark:text-green-400' },
	processing: { label: 'Processing', icon: Clock01Icon, className: 'text-amber-700 dark:text-amber-400' },
	pending: { label: 'Pending', icon: Clock01Icon, className: 'text-slate-500 dark:text-muted-foreground' },
	failed: { label: 'Failed', icon: CancelCircleIcon, className: 'text-red-700 dark:text-red-400' },
}

interface Props {
	receipts: ReceiptPreview[]
}

/** Receipts: the latest uploads with their OCR state. While there are none, the card offers the upload itself. */
export function ReceiptsSectionCard({ receipts }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-receipts-card'
			title='Receipts'
			viewAll={{ href: '/tickets', noun: 'receipts', testId: 'dashboard-receipts-view-all' }}
		>
			{receipts.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-receipts-empty'
					icon={Invoice01Icon}
					tone='ocr'
					title='No receipts yet.'
					message='Photograph one and Listys turns it into a list you can review.'
					action={<UploadTicketDialog className={EMPTY_STATE_ACTION} />}
				/>
			) : (
				<div className='flex flex-1 flex-col gap-1'>
					{receipts.map((receipt, index) => {
						const status = STATUS[receipt.status]
						return (
							<Fragment key={receipt.id}>
								{index > 0 ? (
									<div
										aria-hidden='true'
										className='mx-2 h-px bg-slate-100 dark:bg-border'
									/>
								) : null}
								<DashboardRow
									href={`/tickets/${receipt.id}`}
									title={receipt.title}
									meta={receipt.meta}
									monoMeta
									testId={`dashboard-receipt-${receipt.id}`}
									leading={
										<RowIcon
											icon={Invoice01Icon}
											tone='ocr'
											size='md'
										/>
									}
									trailing={
										<span className={cn('inline-flex h-6 shrink-0 items-center gap-[5px] font-display text-xs font-bold whitespace-nowrap', status.className)}>
											<HugeiconsIcon
												icon={status.icon}
												strokeWidth={1.5}
												aria-hidden='true'
												className='size-3.5'
											/>
											{status.label}
										</span>
									}
								/>
							</Fragment>
						)
					})}
				</div>
			)}
		</DashboardSectionCard>
	)
}
