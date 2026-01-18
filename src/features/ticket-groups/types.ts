import { Database } from '@/features/database.types'

export type Group = Database['public']['Tables']['groups']['Row']
export type InsertGroup = Database['public']['Tables']['groups']['Insert']
export type UpdateGroup = Database['public']['Tables']['groups']['Update']
