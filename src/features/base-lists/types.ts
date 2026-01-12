import { Database } from '@/features/database.types'

export type BaseList = Database['public']['Tables']['base_lists']['Row']
export type InsertBaseList = Database['public']['Tables']['base_lists']['Insert']
export type UpdateBaseList = Database['public']['Tables']['base_lists']['Update']

export type BaseListItem = Database['public']['Tables']['base_list_items']['Row']
export type InsertBaseListItem = Database['public']['Tables']['base_list_items']['Insert']
export type UpdateBaseListItem = Database['public']['Tables']['base_list_items']['Update']

export type BaseListWithItems = BaseList & {
  items: BaseListItem[]
}
