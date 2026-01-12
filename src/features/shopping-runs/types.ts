import { Database } from '@/features/database.types'

export type ShoppingRun = Database['public']['Tables']['shopping_runs']['Row']
export type InsertShoppingRun = Database['public']['Tables']['shopping_runs']['Insert']
export type UpdateShoppingRun = Database['public']['Tables']['shopping_runs']['Update']

export type ShoppingRunItem = Database['public']['Tables']['shopping_run_items']['Row']
export type InsertShoppingRunItem = Database['public']['Tables']['shopping_run_items']['Insert']
export type UpdateShoppingRunItem = Database['public']['Tables']['shopping_run_items']['Update']

export type ShoppingRunWithItems = ShoppingRun & {
  items: ShoppingRunItem[]
}
