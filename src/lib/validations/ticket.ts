import { z } from 'zod'

export const uploadTicketSchema = z.object({
  group_id: z.string().uuid().optional(),
  store_name: z.string().max(100).optional(),
})

export const mergeTicketItemsSchema = z.object({
  ticket_id: z.string().uuid(),
  base_list_id: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      merge: z.boolean(),
    })
  ),
})

export type UploadTicketInput = z.infer<typeof uploadTicketSchema>
export type MergeTicketItemsInput = z.infer<typeof mergeTicketItemsSchema>
