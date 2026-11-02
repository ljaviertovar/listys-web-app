import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'
import type { Store, StoreDetail } from '@/types/stores'

export async function getStores() {
  return apiGet<Store[]>('/api/v1/stores')
}

export async function getStoreDetail(id: string) {
  return apiGet<StoreDetail>(`/api/v1/stores/${id}`)
}

export async function createStore(data: { name: string }) {
  return apiPost<Store>('/api/v1/stores', data)
}

export async function renameStore(id: string, data: { name: string }) {
  return apiPatch<Store>(`/api/v1/stores/${id}`, data)
}

export async function mergeStores(targetId: string, data: { source_store_id: string }) {
  return apiPost<Store>(`/api/v1/stores/${targetId}/merge`, data)
}

export async function removeStoreName(storeId: string, aliasId: string) {
  return apiDelete<undefined>(`/api/v1/stores/${storeId}/aliases/${aliasId}`)
}
