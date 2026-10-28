import { z } from 'zod'
import { MAX_TICKET_ITEMS_MERGE, MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'

// Non-file multipart fields of an upload, checked on the server before any photo is stored. The store name is optional
// raw text (OCR fills it from the receipt header when absent); blank means absent.
export const uploadTicketFieldsSchema = z.object({
  store_name: z.preprocess(
    value => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() || undefined : value ?? undefined),
    z.string({ message: 'Store name must be text' }).max(100, 'Store name is too long').optional()
  ),
})

// The upload form asks for photos only.
export const uploadTicketSchema = z.object({
  files: z
    .array(
      z.instanceof(File, { message: 'Please select image files' })
        .refine((file) => file.size <= 10 * 1024 * 1024, 'Each file must be less than 10MB')
        .refine((file) => file.type.startsWith('image/'), 'Please select image files only')
    )
    .min(1, 'Please select at least one image')
    .max(MAX_IMAGES_PER_TICKET, `Maximum ${MAX_IMAGES_PER_TICKET} images per ticket`),
})

// The user's decisions from the review step: link a receipt line to an existing item of the list, or (null) add a line
// remembered from an earlier link as a new item instead.
export const mergeLinkSchema = z.object({
  ticket_item_id: z.string().uuid(),
  base_list_item_id: z.string().uuid().nullable(),
})

export const mergeTicketItemsBaseSchema = z.object({
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
  links: z
    .array(mergeLinkSchema)
    .max(MAX_TICKET_ITEMS_MERGE, `Cannot link more than ${MAX_TICKET_ITEMS_MERGE} items at once`)
    .optional(),
})

/** Each link must name a different line, and only a line that is being added. Kept apart so route schemas can reuse it. */
export function refineMergeLinks(
  payload: { items: Array<{ id: string; merge: boolean }>; links?: Array<{ ticket_item_id: string }> },
  ctx: z.RefinementCtx
) {
  if (!payload.links) return
  const selected = new Set(payload.items.filter(item => item.merge).map(item => item.id))
  const seen = new Set<string>()

  payload.links.forEach((link, index) => {
    if (seen.has(link.ticket_item_id)) {
      ctx.addIssue({ code: 'custom', path: ['links', index, 'ticket_item_id'], message: 'Each link needs a distinct receipt line' })
    }
    seen.add(link.ticket_item_id)

    if (!selected.has(link.ticket_item_id)) {
      ctx.addIssue({
        code: 'custom',
        path: ['links', index, 'ticket_item_id'],
        message: 'A linked line is not one of the selected receipt lines',
      })
    }
  })
}

export const mergeTicketItemsSchema = mergeTicketItemsBaseSchema.superRefine(refineMergeLinks)

export const createBaseListFromTicketSchema = z.object({
  ticket_id: z.string().uuid(),
  // Optional since groups left the interface: without it the list goes to the user's default group.
  group_id: z.string().uuid().nullish(),
  name: z.string().min(1, 'Name is required').max(100),
  item_ids: z
    .array(z.string().uuid())
    .min(1, 'At least one item must be selected')
    .max(MAX_TICKET_ITEMS_MERGE, `Cannot add more than ${MAX_TICKET_ITEMS_MERGE} items at once`),
})

// PATCH /tickets/{id}: assign or clear the receipt's store, and (unchanged) its group.
export const updateTicketSchema = z
  .object({
    group_id: z.string().uuid().nullable().optional(),
    store_id: z.string().uuid().nullable().optional(),
  })
  .refine(payload => payload.group_id !== undefined || payload.store_id !== undefined, {
    message: 'At least one field must be provided',
  })

const attachTicketLinkSchema = z.object({
  ticket_item_id: z.string().uuid(),
  shopping_session_item_id: z.string().uuid().nullable(),
}).strict()

export const attachTicketToSessionSchema = z.object({
  shopping_session_id: z.string().uuid(),
  links: z.array(attachTicketLinkSchema).max(MAX_TICKET_ITEMS_MERGE).optional(),
  added_item_ids: z.array(z.string().uuid()).max(MAX_TICKET_ITEMS_MERGE).optional(),
  total_amount: z.number().finite().min(0).nullable().optional(),
}).strict().superRefine((payload, ctx) => {
  const linkedIds = payload.links?.map(link => link.ticket_item_id) ?? []
  const addedIds = payload.added_item_ids ?? []
  const allIds = [...linkedIds, ...addedIds]
  const uniqueIds = new Set(allIds)

  if (uniqueIds.size !== allIds.length) {
    ctx.addIssue({ code: 'custom', path: ['links'], message: 'Each receipt line can be included only once' })
  }
})

export type UploadTicketInput = z.infer<typeof uploadTicketSchema>
export type MergeTicketItemsInput = z.infer<typeof mergeTicketItemsSchema>
export type CreateBaseListFromTicketInput = z.infer<typeof createBaseListFromTicketSchema>
