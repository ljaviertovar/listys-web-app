import type { Database } from '@/types/database.types'
import type { StoreRef } from '@/types/stores'

export type Ticket = Database['public']['Tables']['tickets']['Row']
export type InsertTicket = Database['public']['Tables']['tickets']['Insert']
export type UpdateTicket = Database['public']['Tables']['tickets']['Update']

export type TicketItem = Database['public']['Tables']['ticket_items']['Row']
export type InsertTicketItem = Database['public']['Tables']['ticket_items']['Insert']
export type UpdateTicketItem = Database['public']['Tables']['ticket_items']['Update']

export type TicketWithItems = Ticket & {
  items: TicketItem[]
}

/** Store fields that receipt reads add: the confirmed store, and on a single receipt the store its raw name resolves to. */
export type TicketStoreFields = {
  store?: StoreRef | null
  store_suggestion?: StoreRef | null
}

export type OCRItem = {
  name: string
  quantity: number
  unit: string | null
  price: number | null
  category: string | null
}
