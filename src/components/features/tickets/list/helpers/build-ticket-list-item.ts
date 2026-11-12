import { formatCurrency, formatShortDate } from '@/utils'

/** The columns of a receipt row the list needs (a receipt with its confirmed store, as the receipts endpoint returns it). */
interface TicketListSource {
	id: string
	created_at: string | null
	ocr_status: string | null
	total_items: number | null
	total_amount: number | null
	image_paths?: string[] | null
	image_path?: string | null
	store?: { name: string } | null
}

export interface TicketListItemData {
	id: string
	/** Receipt cards keep a neutral title; a confirmed store belongs in classification. */
	title: string
	storeName: string | null
	/** Raw `ocr_status` column; anything unknown reads as pending. */
	status: string | null
	itemsCount: number | null
	photoCount: number
	/** Already formatted on the server, so no date has to cross the client boundary. */
	uploadedLabel: string
	totalLabel: string | null
	storeConfirmed: boolean
}

/**
 * The card title stays generic so the confirmed store can keep its distinct entity role in the classification row.
 */
export function buildTicketListItem(ticket: TicketListSource, now = new Date()): TicketListItemData {
	const uploadedAt = ticket.created_at ? new Date(ticket.created_at) : null
	const storeName = ticket.store?.name.trim() || null
	const photoCount = ticket.image_paths?.length || (ticket.image_path ? 1 : 0)

	return {
		id: ticket.id,
		title: 'Receipt',
		storeName,
		status: ticket.ocr_status,
		itemsCount: ticket.total_items,
		photoCount,
		uploadedLabel: uploadedAt ? `Uploaded ${formatShortDate(uploadedAt, now)}` : 'Upload date unknown',
		totalLabel: ticket.ocr_status === 'completed' && typeof ticket.total_amount === 'number' ? formatCurrency(ticket.total_amount) : null,
		storeConfirmed: storeName !== null,
	}
}
