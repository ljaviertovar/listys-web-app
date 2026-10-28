import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'

export async function createBaseList(data: unknown) {
  return apiPost('/api/v1/base-lists', data)
}

export async function updateBaseList(id: string, data: unknown) {
  return apiPatch(`/api/v1/base-lists/${id}`, data)
}

export async function deleteBaseList(id: string) {
  const res = await apiDelete(`/api/v1/base-lists/${id}`)
  return res.error ? res : { data: { success: true } }
}

export async function getBaseList(id: string) {
  return apiGet(`/api/v1/base-lists/${id}`)
}

export async function getBaseLists() {
  return apiGet('/api/v1/base-lists')
}

export type LikelyNeededItem = {
  id: string
  name: string
  base_list: { id: string; name: string }
  usual_store: { id: string; name: string } | null
  interval_days: number
  days_since: number
}

export async function getLikelyNeededItems(limit = 5) {
  return apiGet<LikelyNeededItem[]>(`/api/v1/base-list-items?filter=likely_needed&limit=${limit}`)
}

export async function createBaseListItem(data: { base_list_id: string } & Record<string, unknown>) {
  const { base_list_id, ...payload } = data
  return apiPost(`/api/v1/base-lists/${base_list_id}/items`, payload)
}

export async function updateBaseListItem(id: string, data: unknown) {
  return apiPatch(`/api/v1/base-list-items/${id}`, data)
}

export async function deleteBaseListItem(id: string) {
  const res = await apiDelete(`/api/v1/base-list-items/${id}`)
  return res.error ? res : { data: { success: true } }
}
