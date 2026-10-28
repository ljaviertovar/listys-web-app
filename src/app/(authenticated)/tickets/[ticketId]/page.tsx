import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { TicketAttachCard, TicketReview, TicketStoreCard, TicketSummaryCard, sumLineTotals, toTicketStatus } from '@/components/features/tickets'

import { getTicket } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatDate, formatTime, getReceiptStoreLabel } from '@/utils'

import type { Ticket, TicketStoreFields } from '@/types'

/** Columns the generated database types do not list yet. */
type TicketRow = Ticket & TicketStoreFields & { image_paths?: string[] | null; ocr_error?: string | null }

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
	const { ticketId } = await params

	const supabase = await createClient()

	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: ticket, error } = await getTicket(ticketId)

	if (error || !ticket) {
		redirect('/tickets')
	}

	// Format date on server side
	const uploadedAt = ticket.created_at ? new Date(ticket.created_at) : null
	const ticketItems = ticket.items || []
	const extractedItemsCount = ticket.total_items ?? ticketItems.length
	const pricedItemsCount = ticketItems.filter((item: { price?: number | null }) => item.price !== null).length
	const { image_paths: storedPaths, ocr_error: ocrError, store, store_suggestion: storeSuggestion } = ticket as TicketRow
	const imagePaths: string[] = storedPaths && storedPaths.length > 0 ? storedPaths : ticket.image_path ? [ticket.image_path] : []
	const storeLabel = getReceiptStoreLabel(ticket)

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/tickets', label: 'Back to Receipts' }}
				title={storeLabel}
				desc={
					uploadedAt ? (
						<>
							Uploaded{' '}
							<span className='font-mono text-xs font-medium text-slate-600 tabular-nums dark:text-foreground/80'>
								{formatDate(uploadedAt)} · {formatTime(uploadedAt)}
							</span>
						</>
					) : (
						'Upload date unknown'
					)
				}
			/>
			<PageContainer>
				<TicketReview
					ticketId={ticketId}
					title={storeLabel}
					imagePaths={imagePaths}
					items={ticketItems}
					status={toTicketStatus(ticket.ocr_status)}
					ocrError={ocrError}
					storeConfirmed={!!store}
					attachedSession={ticket.shopping_session ?? null}
				>
					{/* The store is read with the items, so it is only worth confirming once the receipt has been read. */}
					{ticket.ocr_status === 'completed' ? (
						<>
							{!ticket.shopping_session && !ticket.base_list_id ? (
								<TicketAttachCard
									ticketId={ticketId}
									items={ticketItems}
									receiptStore={store ?? null}
									totalAmount={ticket.total_amount ?? null}
								/>
							) : null}
						<TicketStoreCard
							ticketId={ticketId}
							store={store ?? null}
							storeSuggestion={storeSuggestion ?? null}
							storeName={ticket.store_name}
						/>
						</>
					) : null}
					<TicketSummaryCard
						ticket={ticket}
						itemsCount={extractedItemsCount}
						pricedItemsCount={pricedItemsCount}
						total={sumLineTotals(ticketItems)}
					/>
				</TicketReview>
			</PageContainer>
		</>
	)
}
