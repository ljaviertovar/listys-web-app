import type { Database } from '@/types/database.types'
import type { StorePriceEntry } from '@/components/features/base-lists/items/helpers/item-store-summary'

export type BaseList = Database['public']['Tables']['base_lists']['Row']
export type InsertBaseList = Database['public']['Tables']['base_lists']['Insert']
export type UpdateBaseList = Database['public']['Tables']['base_lists']['Update']

export type BaseListItem = Database['public']['Tables']['base_list_items']['Row']
export type InsertBaseListItem = Database['public']['Tables']['base_list_items']['Insert']
export type UpdateBaseListItem = Database['public']['Tables']['base_list_items']['Update']

export type BaseListItemWithStoreSummary = BaseListItem & {
  usual_store?: { id: string; name: string; source: 'auto' | 'manual' } | null
  other_stores?: Array<{ id: string; name: string; purchase_count: number }>
  store_prices?: StorePriceEntry[]
}

export type BaseListWithItems = BaseList & {
  items: BaseListItemWithStoreSummary[]
}

export type BaseListWithCount = BaseList & {
  items_count: number
}
