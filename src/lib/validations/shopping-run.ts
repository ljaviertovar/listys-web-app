import { z } from 'zod'

export const createShoppingRunSchema = z.object({
  base_list_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
})

export const updateShoppingRunSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  status: z.enum(['active', 'completed']).optional(),
  total_amount: z.number().positive().optional(),
  sync_to_base: z.boolean().optional(),
  general_notes: z.string().max(1000).optional(),
})

export const completeShoppingRunSchema = z.object({
  total_amount: z.number().positive().optional(),
  sync_to_base: z.boolean().default(false),
  general_notes: z.string().max(1000).optional(),
})

export const updateShoppingRunItemSchema = z.object({
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

export const createShoppingRunItemSchema = z.object({
  shopping_run_id: z.string().uuid(),
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

export type CreateShoppingRunInput = z.infer<typeof createShoppingRunSchema>
export type UpdateShoppingRunInput = z.infer<typeof updateShoppingRunSchema>
export type CompleteShoppingRunInput = z.infer<typeof completeShoppingRunSchema>
export type UpdateShoppingRunItemInput = z.infer<typeof updateShoppingRunItemSchema>
export type CreateShoppingRunItemInput = z.infer<typeof createShoppingRunItemSchema>
