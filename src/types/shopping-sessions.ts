import type { Database } from '@/types/database.types'

export type TripReceipt = {
  id: string
  store: { id: string; name: string } | null
  total_amount: number | null
  items_count: number
  covered_item_ids?: string[]
}

export type ShoppingSession = Database['public']['Tables']['shopping_sessions']['Row']
export type InsertShoppingSession = Database['public']['Tables']['shopping_sessions']['Insert']
export type UpdateShoppingSession = Database['public']['Tables']['shopping_sessions']['Update']

export type ShoppingSessionItem = Database['public']['Tables']['shopping_session_items']['Row']
export type InsertShoppingSessionItem = Database['public']['Tables']['shopping_session_items']['Insert']
export type UpdateShoppingSessionItem = Database['public']['Tables']['shopping_session_items']['Update']

export type ShoppingSessionWithItems = ShoppingSession & {
  items: ShoppingSessionItem[]
}
