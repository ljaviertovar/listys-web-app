import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'

export async function getTickets() {
  return apiGet('/api/v1/tickets')
}

export async function getTicket(id: string) {
  return apiGet(`/api/v1/tickets/${id}`)
}

export async function mergeTicketItemsToBaseList(data: { ticket_id: string } & Record<string, unknown>) {
  const { ticket_id, ...payload } = data
  const res = await apiPost<{ success: boolean; new_count: number; updated_count: number; skipped_count: number }>(
    `/api/v1/tickets/${ticket_id}/merge-to-base-list`,
    payload
  )

  if (res.error) return { error: res.error }

  return res.data ?? { success: true, new_count: 0, updated_count: 0, skipped_count: 0 }
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

export async function assignTicketToGroup(ticketId: string, groupId: string) {
  return apiPatch(`/api/v1/tickets/${ticketId}`, { group_id: groupId })
}

export async function getOrphanedStorageImages() {
  return apiGet('/api/v1/tickets/maintenance/orphaned-images')
}

export async function cleanupOrphanedStorageImages() {
  return apiPost('/api/v1/tickets/maintenance/cleanup-orphaned-images')
}
