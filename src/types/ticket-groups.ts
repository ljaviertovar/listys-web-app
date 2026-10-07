import type { Database } from '@/types/database.types'

export type Group = Database['public']['Tables']['groups']['Row']
export type InsertGroup = Database['public']['Tables']['groups']['Insert']
export type UpdateGroup = Database['public']['Tables']['groups']['Update']
