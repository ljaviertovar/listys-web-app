import { z } from 'zod'
import { MAX_TICKET_ITEMS_MERGE } from '@/lib/config/limits'

export const uploadTicketSchema = z.object({
  group_id: z.string().uuid().optional(),
  store_name: z.string().max(100).optional(),
})

export const mergeTicketItemsSchema = z.object({
  ticket_id: z.string().uuid(),
  base_list_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        merge: z.boolean(),
      })
    )
    .min(1, 'At least one item must be selected')
    .max(MAX_TICKET_ITEMS_MERGE, `Cannot merge more than ${MAX_TICKET_ITEMS_MERGE} items at once`),
})

export const createBaseListFromTicketSchema = z.object({
  ticket_id: z.string().uuid(),
  group_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  item_ids: z
    .array(z.string().uuid())
    .min(1, 'At least one item must be selected')
    .max(MAX_TICKET_ITEMS_MERGE, `Cannot add more than ${MAX_TICKET_ITEMS_MERGE} items at once`),
})

export type UploadTicketInput = z.infer<typeof uploadTicketSchema>
export type MergeTicketItemsInput = z.infer<typeof mergeTicketItemsSchema>
export type CreateBaseListFromTicketInput = z.infer<typeof createBaseListFromTicketSchema>
