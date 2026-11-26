import { notFound, redirect } from 'next/navigation'

import { PageContainer } from '@/components/app'
import { ReceiptTicketHeader, TicketReview, TicketSpendingCard, TicketStatusChip, TicketStoreCard, TicketSummaryCard, TicketUnreadableState, hasRecordedReceiptTotal, isReadWithoutItems, isStandaloneReceipt, sumLineTotals, toTicketStatus } from '@/components/features/tickets'

import { ReceiptDateFacts } from '@/components/features/tickets/receipt/receipt-date-facts'

import { getTicket } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatCurrency, formatDate, getReceiptName } from '@/utils'

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
		notFound()
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
	// The same name the receipt carries on its card in the list, in every state of the receipt.
	const receiptName = getReceiptName(ticket)
	const receiptStatus = toTicketStatus(ticket.ocr_status, ticketItems.length)
	const isReadReceipt = receiptStatus === 'completed'
	// A read that failed and a read that found no lines share one screen: the receipt gave nothing to review.
	const isUnreadable = receiptStatus === 'failed'
	const readWithoutItems = isReadWithoutItems(ticket.ocr_status, ticketItems.length)
	const itemsRead = readWithoutItems ? 0 : extractedItemsCount
	const categoriesRead = new Set(ticketItems.map(item => item.category?.trim() || 'Other')).size
	const headerFacts = isReadReceipt || readWithoutItems
		? [
				`${itemsRead} ${itemsRead === 1 ? 'item' : 'items'}`,
				...(itemsRead > 0 && categoriesRead > 0 ? [`${categoriesRead} ${categoriesRead === 1 ? 'category' : 'categories'}`] : []),
			]
		: isUnreadable
			? [`${imagePaths.length} ${imagePaths.length === 1 ? 'photo' : 'photos'}`]
			: []

	return (
		<>
			<ReceiptTicketHeader
				title={receiptName}
				back={{ href: '/tickets', label: 'Receipts' }}
				status={<TicketStatusChip status={receiptStatus} />}
				dates={<ReceiptDateFacts uploadedAt={ticket.created_at} purchaseDate={ticket.purchase_date ?? null} testId='receipt-detail-dates' />}
				facts={headerFacts}
				total={isReadReceipt && typeof ticket.total_amount === 'number' ? formatCurrency(ticket.total_amount) : null}
			/>
			<PageContainer>
				<TicketReview
					ticketId={ticketId}
					title={receiptName}
					imagePaths={imagePaths}
					items={ticketItems}
					status={receiptStatus}
					ocrError={receiptStatus === 'failed' && ticket.ocr_status === 'completed' ? 'We couldn’t read any items. Try again, or upload a clearer photo.' : ocrError}
					storeConfirmed={!!store}
					receiptDate={uploadedAt ? formatDate(uploadedAt) : null}
					attachedSession={ticket.shopping_session ?? null}
					before={!isUnreadable && isStandaloneReceipt(ticket) ? (
						<TicketSpendingCard
							ticketId={ticketId}
							included={ticket.include_in_spending === true}
							hasTotal={hasRecordedReceiptTotal(ticket.total_amount)}
						/>
					) : null}
					unreadable={isUnreadable ? <TicketUnreadableState ocrError={ocrError} ticketId={ticketId} kind={readWithoutItems ? 'no-items' : 'failed'} storeRecognized={Boolean(store || storeSuggestion || ticket.store_name?.trim())} /> : null}
					top={
						isReadReceipt || readWithoutItems ? (
							<TicketStoreCard
								ticketId={ticketId}
								store={store ?? null}
								storeSuggestion={storeSuggestion ?? null}
								storeName={ticket.store_name}
								itemsFound={ticketItems.length > 0}
								purchaseDate={{
									day: ticket.purchase_date ?? null,
									byUser: ticket.purchase_date_by_user === true,
									uploadedAt: ticket.created_at,
									countsInSpending: ticket.include_in_spending === true && isStandaloneReceipt(ticket),
								}}
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
