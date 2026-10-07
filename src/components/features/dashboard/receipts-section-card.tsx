import { Invoice01Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardRow } from './dashboard-row'
import { DashboardSectionCard } from './dashboard-section-card'
import { SectionFooterLink } from './section-footer-link'
import type { ReceiptPreview } from './helpers/build-dashboard-model'

const STATUS_LABELS: Record<ReceiptPreview['status'], string> = {
	completed: 'Completed',
	processing: 'Processing',
	failed: 'Failed',
	pending: 'Pending',
}

interface Props {
	receipts: ReceiptPreview[]
	count: number
}

/** Receipts: the latest uploads with their OCR state. Uploading lives in the page header (or the hero for a new account), not here. */
export function ReceiptsSectionCard({ receipts, count }: Props) {
	return (
		<DashboardSectionCard
			testId='dashboard-receipts-card'
			icon={Invoice01Icon}
			tone='ocr'
			title='Receipts'
			description='Upload and manage receipts. Create shopping lists from them.'
			count={count}
			countLabel={count === 1 ? 'receipt' : 'receipts'}
			footer={
				<SectionFooterLink
					href='/tickets'
					testId='dashboard-receipts-view-all'
				>
					View all receipts
				</SectionFooterLink>
			}
		>
			{receipts.length === 0 ? (
				<DashboardEmptyState
					testId='dashboard-receipts-empty'
					message='No receipts yet. Upload one with the button at the top and Listys turns it into a list you can review.'
				/>
			) : (
				receipts.map(receipt => (
					<DashboardRow
						key={receipt.id}
						href={`/tickets/${receipt.id}`}
						title={receipt.title}
						meta={receipt.meta}
						monoMeta
						testId={`dashboard-receipt-${receipt.id}`}
						trailing={
							// A finished receipt is the normal case, so it is plain text; only the states that need a look get a badge.
							receipt.status === 'completed' ? (
								<span className='text-xs text-muted-foreground'>{STATUS_LABELS.completed}</span>
							) : (
								<Badge variant={receipt.status}>{STATUS_LABELS[receipt.status]}</Badge>
							)
						}
					/>
				))
			)}
		</DashboardSectionCard>
	)
}
