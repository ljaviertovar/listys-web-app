import { z } from 'zod'

import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

export const createBaseListSchema = z.object({
  // Optional since groups left the interface: without it the list goes to the user's default group.
  group_id: z.string().uuid().nullish(),
  name: z.string().min(1, 'Name is required').max(100),
  notes: z.string().max(500).nullable().optional(),
})

export const updateBaseListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const createBaseListItemSchema = z.object({
  base_list_id: z.string().uuid(),
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
  sort_order: z.number().int().default(0),
})

export const updateBaseListItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200).optional(),
  quantity: z
    .number()
    .min(0.1, 'Quantity must be at least 0.1')
    .max(99, 'Quantity cannot exceed 99')
    .refine(n => Math.round(n * 10) === n * 10, 'Quantity must be in steps of 0.1')
    .optional(),
  unit: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  sort_order: z.number().int().optional(),
  usual_store_id: z.string().uuid().nullable().optional(),
}).strict().superRefine((data, context) => {
  if (Object.hasOwn(data, 'usual_store_id') && Object.keys(data).some(key => key !== 'usual_store_id')) {
    context.addIssue({
      code: 'custom',
      path: ['usual_store_id'],
      message: 'Usual store must be updated separately from other item fields.',
    })
  }
})

/** Checks or unchecks items as needed for the next trip: one row, "Select All" over what is shown, or "Clear". */
export const setBaseListItemsNeededSchema = z.strictObject({
  changes: z
    .array(z.strictObject({ item_id: z.string().uuid(), needed: z.boolean() }))
    .min(1, 'Choose at least one item')
    .max(MAX_ITEMS_PER_BASE_LIST)
    .refine(changes => new Set(changes.map(change => change.item_id)).size === changes.length, 'Each item can appear only once'),
})

export type SetBaseListItemsNeededInput = z.infer<typeof setBaseListItemsNeededSchema>
export type CreateBaseListInput = z.infer<typeof createBaseListSchema>
export type UpdateBaseListInput = z.infer<typeof updateBaseListSchema>
export type CreateBaseListItemInput = z.infer<typeof createBaseListItemSchema>
export type UpdateBaseListItemInput = z.infer<typeof updateBaseListItemSchema>
