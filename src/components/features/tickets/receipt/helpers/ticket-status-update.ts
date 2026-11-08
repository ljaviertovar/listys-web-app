import { toTicketStatus, type TicketStatus } from '../../helpers/ticket-status'

/**
 * What to do with a status the receipt just reported. Only the first terminal status (read or failed) asks for a refresh,
 * because that is when the page has items or an error to load; later reports only update the chip.
 */
export function applyTicketStatusUpdate(raw: string | null | undefined, alreadyRefreshed: boolean): { status: TicketStatus; refresh: boolean } {
	const status = toTicketStatus(raw)
	const terminal = status === 'completed' || status === 'failed'
	return { status, refresh: terminal && !alreadyRefreshed }
}
