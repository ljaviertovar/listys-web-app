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

export async function getBaseListsByGroup(groupId: string) {
  return apiGet(`/api/v1/groups/${groupId}/base-lists`)
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
