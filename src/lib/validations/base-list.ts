import { z } from 'zod'

export const createBaseListSchema = z.object({
  group_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
})

export const updateBaseListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
})

export const createBaseListItemSchema = z.object({
  base_list_id: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(200),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  unit: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  sort_order: z.number().int().default(0),
})

export const updateBaseListItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200).optional(),
  quantity: z.number().positive('Quantity must be greater than 0').optional(),
  unit: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  sort_order: z.number().int().optional(),
})

export type CreateBaseListInput = z.infer<typeof createBaseListSchema>
export type UpdateBaseListInput = z.infer<typeof updateBaseListSchema>
export type CreateBaseListItemInput = z.infer<typeof createBaseListItemSchema>
export type UpdateBaseListItemInput = z.infer<typeof updateBaseListItemSchema>
