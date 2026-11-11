import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { DataFigure, DataLine } from '@/components/commons'
import { ReceiptAddedToListNote, TicketAttachCard, NoStoreBadge, TicketReview, TicketStatusChip, TicketStoreCard, TicketSummaryCard, TicketUnreadableState, getReceiptTripSurface, isReadWithoutItems, sumLineTotals, toTicketStatus } from '@/components/features/tickets'

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
	// A saved receipt of no confirmed store is titled by its date, and says so with the amber chip the list uses.
	const savedWithoutStore = isReadReceipt && !isReviewing && !store
	const headerTitle = isReviewing ? 'Review receipt' : (isUnreadable || savedWithoutStore) && uploadedAt ? `Receipt · ${formatShortDate(uploadedAt)}` : storeLabel
	const tripSurface = getReceiptTripSurface({
		attached: !!ticket.shopping_session,
		addedToList: !!ticket.base_list_id,
		uploadedFromTrip: !!ticket.uploaded_from_session_id,
	})

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/tickets', label: 'Receipts' }}
				title={headerTitle}
				aside={isReadReceipt || isUnreadable ? <TicketStatusChip status={readWithoutItems ? 'completed' : receiptStatus} /> : undefined}
				desc={
					isReadReceipt && uploadedAt ? (
						<div className='flex flex-col items-start gap-1.5'>
							{savedWithoutStore ? <NoStoreBadge testId='ticket-no-store-chip' /> : null}
							<DataLine testId='ticket-data'>
								<>
									<DataFigure>{extractedItemsCount}</DataFigure> {extractedItemsCount === 1 ? 'item' : 'items'}
								</>
								<DataFigure>{formatDate(uploadedAt)}</DataFigure>
								{typeof ticket.total_amount === 'number' ? <DataFigure>{formatCurrency(ticket.total_amount)}</DataFigure> : null}
							</DataLine>
						</div>
					) : isUnreadable && uploadedAt ? (
						<DataLine testId='ticket-data'>
							<>
								<DataFigure>{readWithoutItems ? 0 : imagePaths.length}</DataFigure> {readWithoutItems ? 'items found' : imagePaths.length === 1 ? 'photo' : 'photos'}
							</>
							{`Uploaded ${formatTime(uploadedAt)}`}
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
