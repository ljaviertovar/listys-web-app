import type { BaseListItem } from '@/types'

/**
 * What "Undo" sends to bring a deleted item back: the item as it was, as a new item of its list. The API has no
 * restore, so the item gets a new id; fields that were empty are left out because the API rejects `null`.
 */
export function toRestorePayload(item: BaseListItem): Record<string, unknown> {
	return {
		base_list_id: item.base_list_id,
		name: item.name,
		quantity: item.quantity ?? 1,
		sort_order: item.sort_order ?? 0,
		...(item.unit ? { unit: item.unit } : {}),
		...(item.notes ? { notes: item.notes } : {}),
		...(item.category ? { category: item.category } : {}),
	}
}
