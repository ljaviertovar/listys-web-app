import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'

export async function createShoppingSession(data: unknown) {
  const res = await apiPost('/api/v1/shopping-sessions', data)
  if (res.error && res.details && typeof res.details === 'object' && 'activeSessionId' in res.details) {
    return { ...res, activeSessionId: (res.details as { activeSessionId?: string }).activeSessionId }
  }
  return res
}

export async function updateShoppingSession(id: string, data: unknown) {
  return apiPatch(`/api/v1/shopping-sessions/${id}`, data)
}

export async function completeShoppingSession(id: string, data: unknown) {
  return apiPost(`/api/v1/shopping-sessions/${id}/complete`, data)
}

export async function getActiveShoppingSession() {
  return apiGet('/api/v1/shopping-sessions?status=active')
}

export async function getShoppingSession(id: string) {
  return apiGet(`/api/v1/shopping-sessions/${id}`)
}

export async function getShoppingHistory() {
  return apiGet('/api/v1/shopping-sessions?status=completed')
}

export async function updateShoppingSessionItem(id: string, data: unknown) {
  return apiPatch(`/api/v1/shopping-session-items/${id}`, data)
}

export async function toggleShoppingSessionItem(id: string, checked: boolean) {
  return updateShoppingSessionItem(id, { checked })
}

export async function createShoppingSessionItem(data: { shopping_session_id: string } & Record<string, unknown>) {
  const { shopping_session_id, ...payload } = data
  return apiPost(`/api/v1/shopping-sessions/${shopping_session_id}/items`, payload)
}

export async function deleteShoppingSessionItem(id: string) {
  const res = await apiDelete(`/api/v1/shopping-session-items/${id}`)
  return res.error ? res : { data: { success: true } }
}

export async function cancelShoppingSession(id: string) {
  const res = await apiDelete(`/api/v1/shopping-sessions/${id}`)
  return res.error ? res : { data: { success: true } }
}
