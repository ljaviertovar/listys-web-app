import { formatCurrency, getReceiptName } from '@/utils'
import { hasRecordedReceiptTotal, isStandaloneReceipt } from '../../helpers/receipt-spending'

/** The columns of a receipt row the list needs (a receipt with its confirmed store, as the receipts endpoint returns it). */
interface TicketListSource {
	id: string
	created_at: string | null
	purchase_date?: string | null
	ocr_status: string | null
	total_items: number | null
	total_amount: number | null
	include_in_spending?: boolean
	shopping_session_id?: string | null
	uploaded_from_session_id?: string | null
	image_paths?: string[] | null
	image_path?: string | null
	store?: { name: string } | null
	/** The store name as the receipt printed it; names the receipt while no store is confirmed. */
	store_name?: string | null
}

export interface TicketListItemData {
	id: string
	/** "<store> Receipt": the same name the receipt's own screen carries. */
	title: string
	/** The confirmed store only: it feeds the store filter, not the title. */
	storeName: string | null
	/** Raw `ocr_status` column; anything unknown reads as pending. */
	status: string | null
	itemsCount: number | null
	photoCount: number
	uploadedAt: string | null
	purchaseDate: string | null
	totalLabel: string | null
	storeConfirmed: boolean
	includedInSpending?: boolean
}

/** The title is the receipt's name; the upload date is data, and the confirmed store only drives the filter. */
export function buildTicketListItem(ticket: TicketListSource): TicketListItemData {
	const storeName = ticket.store?.name.trim() || null
	const photoCount = ticket.image_paths?.length || (ticket.image_path ? 1 : 0)

	return {
		id: ticket.id,
		title: getReceiptName(ticket),
		storeName,
		status: ticket.ocr_status,
		itemsCount: ticket.total_items,
		photoCount,
		uploadedAt: ticket.created_at,
		purchaseDate: ticket.purchase_date ?? null,
		totalLabel: ticket.ocr_status === 'completed' && typeof ticket.total_amount === 'number' ? formatCurrency(ticket.total_amount) : null,
		storeConfirmed: storeName !== null,
		includedInSpending: ticket.include_in_spending === true && isStandaloneReceipt(ticket) && hasRecordedReceiptTotal(ticket.total_amount),
	}
}
