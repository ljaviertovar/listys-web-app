import { Database } from '@/lib/supabase/database.types'

export type ShoppingSession = Database['public']['Tables']['shopping_sessions']['Row']
export type InsertShoppingSession = Database['public']['Tables']['shopping_sessions']['Insert']
export type UpdateShoppingSession = Database['public']['Tables']['shopping_sessions']['Update']

export type ShoppingSessionItem = Database['public']['Tables']['shopping_session_items']['Row']
export type InsertShoppingSessionItem = Database['public']['Tables']['shopping_session_items']['Insert']
export type UpdateShoppingSessionItem = Database['public']['Tables']['shopping_session_items']['Update']

export type ShoppingSessionWithItems = ShoppingSession & {
  items: ShoppingSessionItem[]
}
