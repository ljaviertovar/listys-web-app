import { z } from 'zod'

export const createShoppingSessionSchema = z.object({
  base_list_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
})

export const updateShoppingSessionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  status: z.enum(['active', 'completed']).optional(),
  total_amount: z.number().positive().optional(),
  sync_to_base: z.boolean().optional(),
  general_notes: z.string().max(1000).optional(),
})

export const completeShoppingSessionSchema = z.object({
  total_amount: z.number().positive().optional(),
  sync_to_base: z.boolean().default(false),
  general_notes: z.string().max(1000).optional(),
})

export const updateShoppingSessionItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200).optional(),
  quantity: z
    .number()
    .min(0.1, 'Quantity must be at least 0.1')
    .max(99, 'Quantity cannot exceed 99')
    .refine(n => Math.round(n * 10) === n * 10, 'Quantity must be in steps of 0.1')
    .optional(),
  unit: z.string().max(20).optional(),
  checked: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  sort_order: z.number().int().optional(),
})

export const createShoppingSessionItemSchema = z.object({
  shopping_session_id: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(200),
  quantity: z
    .number()
    .min(0.1, 'Quantity must be at least 0.1')
    .max(99, 'Quantity cannot exceed 99')
    .refine(n => Math.round(n * 10) === n * 10, 'Quantity must be in steps of 0.1')
    .default(1),
  unit: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
})

export type CreateShoppingSessionInput = z.infer<typeof createShoppingSessionSchema>
export type UpdateShoppingSessionInput = z.infer<typeof updateShoppingSessionSchema>
export type CompleteShoppingSessionInput = z.infer<typeof completeShoppingSessionSchema>
export type UpdateShoppingSessionItemInput = z.infer<typeof updateShoppingSessionItemSchema>
export type CreateShoppingSessionItemInput = z.infer<typeof createShoppingSessionItemSchema>
