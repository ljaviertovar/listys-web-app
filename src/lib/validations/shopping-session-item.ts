import { z } from 'zod'
import { updateShoppingSessionItemSchema } from './shopping-session'

export const versionedSessionItemInputSchema = updateShoppingSessionItemSchema.extend({
  expected_version: z.number().int().positive().max(2147483647),
}).strict().refine(value => Object.keys(value).some(key => key !== 'expected_version'), 'Provide at least one item field.')

export const sessionItemDtoSchema = z.object({
  id: z.string().uuid(),
  shopping_session_id: z.string().uuid(),
  name: z.string(),
  normalized_name: z.string().nullable(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  checked: z.boolean().nullable(),
  notes: z.string().nullable(),
  category: z.string().nullable(),
  sort_order: z.number().int().nullable(),
  price: z.number().nullable(),
  is_other_store: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  version: z.number().int().positive(),
})

export type SessionItemDto = z.infer<typeof sessionItemDtoSchema>
export type VersionedSessionItemInput = z.infer<typeof versionedSessionItemInputSchema>

export function toSessionItemDto(value: unknown): SessionItemDto {
  // Parsing also strips provider-only columns from success and conflict payloads.
  return sessionItemDtoSchema.parse(value)
}
