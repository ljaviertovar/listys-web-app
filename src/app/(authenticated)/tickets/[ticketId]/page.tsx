import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { DataFigure, DataLine } from '@/components/commons'
import { ReceiptAddedToListNote, TicketAttachCard, TicketReview, TicketStoreCard, TicketSummaryCard, getReceiptTripSurface, sumLineTotals, toTicketStatus } from '@/components/features/tickets'

import { getTicket } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatCurrency, formatDate, formatTime, getReceiptStoreLabel } from '@/utils'

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
	// A read receipt is something to review; the store is confirmed in its own card, so the title no longer repeats the raw OCR text.
	const isReadReceipt = ticket.ocr_status === 'completed'
	const headerTitle = isReadReceipt ? 'Review receipt' : storeLabel
	const tripSurface = getReceiptTripSurface({
		attached: !!ticket.shopping_session,
		addedToList: !!ticket.base_list_id,
		uploadedFromTrip: !!ticket.uploaded_from_session_id,
	})

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/tickets', label: 'Back to Receipts' }}
				title={headerTitle}
				desc={
					isReadReceipt && uploadedAt ? (
						<DataLine testId='ticket-data'>
							<>
								<DataFigure>{extractedItemsCount}</DataFigure> {extractedItemsCount === 1 ? 'item' : 'items'}
							</>
							<DataFigure>{formatDate(uploadedAt)}</DataFigure>
							{typeof ticket.total_amount === 'number' ? <DataFigure>{formatCurrency(ticket.total_amount)}</DataFigure> : null}
						</DataLine>
					) : uploadedAt ? (
						<DataLine testId='ticket-data'>
							<>
								Uploaded <DataFigure>{formatDate(uploadedAt)}</DataFigure>
							</>
							<DataFigure>{formatTime(uploadedAt)}</DataFigure>
						</DataLine>
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
					top={
						ticket.ocr_status === 'completed' ? (
							<TicketStoreCard
								ticketId={ticketId}
								store={store ?? null}
								storeSuggestion={storeSuggestion ?? null}
								storeName={ticket.store_name}
							/>
						) : null
					}
				>
					{/* The store is read with the items, so it is only worth confirming once the receipt has been read. */}
					{ticket.ocr_status === 'completed' ? (
						<>
							{tripSurface === 'attach-card' ? (
								<TicketAttachCard
									ticketId={ticketId}
									items={ticketItems}
									receiptStore={store ?? null}
									totalAmount={ticket.total_amount ?? null}
								/>
							) : null}
							{tripSurface === 'added-to-list-note' ? <ReceiptAddedToListNote /> : null}
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
