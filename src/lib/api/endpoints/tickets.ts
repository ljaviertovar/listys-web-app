import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'
import type { Ticket } from '@/types/tickets'

export async function getTickets() {
  return apiGet<Ticket[]>('/api/v1/tickets')
}

export async function getTicket(id: string) {
  return apiGet(`/api/v1/tickets/${id}`)
}

/** Assigns one of the user's stores to the receipt, or clears it with null. */
export async function updateTicketStore(ticketId: string, storeId: string | null) {
  return apiPatch<Ticket>(`/api/v1/tickets/${ticketId}`, { store_id: storeId })
}

export type TicketItemMatch = {
  ticket_item_id: string
  match: 'name' | 'alias' | 'none'
  base_list_item: { id: string; name: string } | null
}

export type TicketSessionCandidate = {
  id: string
  name: string
  status: string
  started_at: string | null
  completed_at: string | null
  store: { id: string; name: string } | null
  base_list: { id: string; name: string }
  checked_count: number
  item_count: number
}

export type TicketSessionMatch = {
  ticket_item_id: string
  match: 'name' | 'alias' | 'none'
  shopping_session_item: { id: string; name: string; checked: boolean } | null
}

export type AttachTicketToSessionInput = {
  shopping_session_id: string
  links?: Array<{ ticket_item_id: string; shopping_session_item_id: string | null }>
  added_item_ids?: string[]
  total_amount?: number | null
}

export type AttachTicketToSessionSummary = {
  completed_now: boolean
  matched_count: number
  checked_now_count: number
  added_count: number
  priced_count: number
  over_limit_count: number
  replayed: boolean
}

export async function getTicketMatches(ticketId: string, baseListId: string) {
  return apiGet<TicketItemMatch[]>(`/api/v1/tickets/${ticketId}/matches?base_list_id=${encodeURIComponent(baseListId)}`)
}

export async function getTicketSessionCandidates(ticketId: string) {
  return apiGet<TicketSessionCandidate[]>(`/api/v1/tickets/${ticketId}/session-candidates`)
}

export async function getTicketSessionMatches(ticketId: string, shoppingSessionId: string) {
  return apiGet<TicketSessionMatch[]>(
    `/api/v1/tickets/${ticketId}/session-matches?shopping_session_id=${encodeURIComponent(shoppingSessionId)}`,
  )
}

export async function attachTicketToSession(ticketId: string, payload: AttachTicketToSessionInput) {
  return apiPost<AttachTicketToSessionSummary>(`/api/v1/tickets/${ticketId}/attach-to-session`, payload)
}

export async function mergeTicketItemsToBaseList(data: { ticket_id: string } & Record<string, unknown>) {
  const { ticket_id, ...payload } = data
  const res = await apiPost<{ success: boolean; new_count: number; updated_count: number; skipped_count: number }>(
    `/api/v1/tickets/${ticket_id}/merge-to-base-list`,
    payload
  )

  if (res.error) return { error: res.error, errorCode: res.errorCode }

  return res.data ?? { success: true }
}

export async function createBaseListFromTicket(data: { ticket_id: string } & Record<string, unknown>) {
  const { ticket_id, ...payload } = data
  return apiPost(`/api/v1/tickets/${ticket_id}/create-base-list`, payload)
}

export async function deleteTicket(id: string) {
  const res = await apiDelete(`/api/v1/tickets/${id}`)
  return res.error ? res : { data: { success: true } }
}

export async function retryTicketOCR(id: string) {
  return apiPost(`/api/v1/tickets/${id}/retry-ocr`)
}

export async function markStuckTicketsAsFailed() {
  return apiPost('/api/v1/tickets/maintenance/mark-stuck-as-failed')
}

export async function getOrphanedStorageImages() {
  return apiGet('/api/v1/tickets/maintenance/orphaned-images')
}

export async function cleanupOrphanedStorageImages() {
  return apiPost('/api/v1/tickets/maintenance/cleanup-orphaned-images')
}
