import { formatCurrency, formatShortDate, formatTime } from '@/utils'

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
	/** The store the user confirmed; a receipt without one is titled by the day it was uploaded. */
	title: string
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
 * The title carries the date when there is no confirmed store, so the data line then only adds the time; with a store as the title the
 * data line carries the date instead.
 */
export function buildTicketListItem(ticket: TicketListSource, now = new Date()): TicketListItemData {
	const uploadedAt = ticket.created_at ? new Date(ticket.created_at) : null
	const storeName = ticket.store?.name.trim() || null
	const photoCount = ticket.image_paths?.length || (ticket.image_path ? 1 : 0)

	return {
		id: ticket.id,
		title: storeName ?? (uploadedAt ? `Receipt · ${formatShortDate(uploadedAt, now)}` : 'Receipt'),
		status: ticket.ocr_status,
		itemsCount: ticket.total_items,
		photoCount,
		uploadedLabel: uploadedAt ? `Uploaded ${storeName ? formatShortDate(uploadedAt, now) : formatTime(uploadedAt)}` : 'Upload date unknown',
		totalLabel: ticket.ocr_status === 'completed' && typeof ticket.total_amount === 'number' ? formatCurrency(ticket.total_amount) : null,
		storeConfirmed: storeName !== null,
	}
}
