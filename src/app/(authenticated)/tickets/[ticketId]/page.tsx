import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { DataFigure, DataLine } from '@/components/commons'
import { TicketReview, TicketStatusChip, TicketStoreCard, TicketSummaryCard, TicketUnreadableState, isReadWithoutItems, sumLineTotals, toTicketStatus } from '@/components/features/tickets'

import { getTicket } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatCurrency, formatDate, formatShortDate, getReceiptStoreLabel } from '@/utils'

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
	if (ticket.uploaded_from_session_id) {
		redirect(`/shopping/${ticket.uploaded_from_session_id}`)
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
	// The list or trip keeps its store as the receipt's identity; before then, the screen is a review.
	const receiptTitle = uploadedAt ? `Receipt · ${formatShortDate(uploadedAt)}` : 'Receipt'
	const headerTitle = isReviewing ? 'Review receipt' : store?.name ?? receiptTitle

	return (
		<>
			<PageHeader
				variant='screen'
				screenStyle='entity-detail'
				back={{ href: '/tickets', label: 'Receipts' }}
				title={headerTitle}
				aside={<TicketStatusChip status={receiptStatus} />}
				desc={
					<DataLine testId='ticket-data'>
						{isReadReceipt || readWithoutItems ? <><DataFigure>{readWithoutItems ? 0 : extractedItemsCount}</DataFigure> {readWithoutItems ? 'items' : extractedItemsCount === 1 ? 'item' : 'items'}</> : isUnreadable ? <><DataFigure>{imagePaths.length}</DataFigure> {imagePaths.length === 1 ? 'photo' : 'photos'}</> : null}
						{uploadedAt ? <DataFigure>{formatShortDate(uploadedAt)}</DataFigure> : 'Upload date unknown'}
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
					attachedSession={ticket.shopping_session ?? null}
					unreadable={isUnreadable ? <TicketUnreadableState ticketId={ticketId} kind={readWithoutItems ? 'no-items' : 'failed'} storeRecognized={Boolean(store || storeSuggestion || ticket.store_name?.trim())} /> : null}
					top={
						isReadReceipt || readWithoutItems ? (
							<TicketStoreCard
								ticketId={ticketId}
								store={store ?? null}
								storeSuggestion={storeSuggestion ?? null}
								storeName={ticket.store_name}
								itemsFound={ticketItems.length > 0}
							/>
						) : null
					}
				>
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
