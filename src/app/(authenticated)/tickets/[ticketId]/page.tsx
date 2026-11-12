import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { DataFigure, DataLine } from '@/components/commons'
import { ReceiptAddedToListNote, TicketAttachCard, TicketReview, TicketStatusChip, TicketStoreCard, TicketSummaryCard, TicketUnreadableState, getReceiptTripSurface, isReadWithoutItems, sumLineTotals, toTicketStatus } from '@/components/features/tickets'

import { getTicket } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatCurrency, formatDate, formatShortDate, formatTime, getReceiptStoreLabel } from '@/utils'

import type { Ticket, TicketItem, TicketStoreFields } from '@/types'

/** Columns the generated database types do not list yet. */
type TicketRow = Ticket & TicketStoreFields & {
	items: TicketItem[]
	shopping_session: { id: string; name: string; status: string | null } | null
	image_paths?: string[] | null
	ocr_error?: string | null
}

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
	const { ticketId } = await params

	const supabase = await createClient()

	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: ticket, error } = await getTicket<TicketRow>(ticketId)

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
	const receiptStatus = toTicketStatus(ticket.ocr_status, ticketItems.length)
	const isReadReceipt = receiptStatus === 'completed'
	// A read that failed and a read that found no lines share one screen: the receipt gave nothing to review.
	const isUnreadable = receiptStatus === 'failed'
	const readWithoutItems = isReadWithoutItems(ticket.ocr_status, ticketItems.length)
	// Until the lines are on a list or a trip the screen is a review; after, it is the receipt of that store.
	const isReviewing = isReadReceipt && !ticket.base_list_id && !ticket.shopping_session
	// Receipt details use the upload date for identity; the store is summarized in its own card below.
	const headerTitle = uploadedAt ? `Receipt · ${formatShortDate(uploadedAt)}` : 'Receipt'
	const tripSurface = getReceiptTripSurface({
		attached: !!ticket.shopping_session,
		addedToList: !!ticket.base_list_id,
		uploadedFromTrip: !!ticket.uploaded_from_session_id,
	})

	return (
		<>
			<PageHeader
				variant='screen'
				screenStyle='entity-detail'
				back={{ href: '/tickets', label: 'Receipts' }}
				title={headerTitle}
				aside={<TicketStatusChip status={readWithoutItems ? 'completed' : receiptStatus} />}
				desc={
					<DataLine testId='ticket-data'>
						{readWithoutItems ? <><DataFigure>0</DataFigure> items found</> : isUnreadable ? <><DataFigure>{imagePaths.length}</DataFigure> {imagePaths.length === 1 ? 'photo' : 'photos'}</> : null}
						{uploadedAt ? <>Uploaded <DataFigure>{formatTime(uploadedAt)}</DataFigure></> : 'Upload date unknown'}
						{isReadReceipt && typeof ticket.total_amount === 'number' ? <DataFigure>{formatCurrency(ticket.total_amount)}</DataFigure> : null}
					</DataLine>
				}
			/>
			<PageContainer>
				<TicketReview
					ticketId={ticketId}
					title={storeLabel}
					imagePaths={imagePaths}
					items={ticketItems}
					status={receiptStatus}
					ocrError={receiptStatus === 'failed' && ticket.ocr_status === 'completed' ? 'We couldn’t read any items. Try again, or upload a clearer photo.' : ocrError}
					storeConfirmed={!!store}
					receiptDate={uploadedAt ? formatDate(uploadedAt) : null}
					saved={isReadReceipt && !isReviewing}
					attachedSession={ticket.shopping_session ?? null}
					unreadable={isUnreadable ? <TicketUnreadableState ticketId={ticketId} kind={readWithoutItems ? 'no-items' : 'failed'} /> : null}
					top={
						isReadReceipt || readWithoutItems ? (
							<TicketStoreCard
								ticketId={ticketId}
								store={store ?? null}
								storeSuggestion={storeSuggestion ?? null}
								storeName={ticket.store_name}
							/>
						) : null
					}
					before={isReadReceipt && tripSurface === 'attach-card' ? <TicketAttachCard
						ticketId={ticketId} items={ticketItems} receiptStore={store ?? null} totalAmount={ticket.total_amount ?? null}
					/> : null}
				>
					{/* The store is read with the items, so it is only worth confirming once the receipt has been read. */}
					{isReadReceipt ? (
						<>
							{tripSurface === 'added-to-list-note' ? <ReceiptAddedToListNote /> : null}
						</>
					) : null}
					{isUnreadable ? null : (
						<TicketSummaryCard
							ticket={{ ...ticket, ocr_status: receiptStatus }}
							itemsCount={extractedItemsCount}
							pricedItemsCount={pricedItemsCount}
							total={sumLineTotals(ticketItems)}
						/>
					)}
				</TicketReview>
			</PageContainer>
		</>
	)
}
