import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'

export async function createGroup(data: unknown) {
  return apiPost('/api/v1/groups', data)
}

export async function updateGroup(id: string, data: unknown) {
  return apiPatch(`/api/v1/groups/${id}`, data)
}

export async function deleteGroup(id: string) {
  const res = await apiDelete(`/api/v1/groups/${id}`)
  return res.error ? res : { data: { success: true } }
}

export async function getGroups() {
  return apiGet('/api/v1/groups')
}

export async function getGroupsWithHistory() {
  return apiGet('/api/v1/groups/history')
}

export async function getGroup(id: string) {
  return apiGet(`/api/v1/groups/${id}`)
}
