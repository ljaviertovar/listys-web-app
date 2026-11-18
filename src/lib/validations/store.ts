import { z } from 'zod'

export function storeNameKey(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/#\s*\d+/g, ' ')
		.replace(/\s\d{3,}\s*$/, '')
		.replace(/[^a-z0-9]+/g, '')
}

// Same shape the database enforces (create_store / rename_store): one line, single spaces, 1–100 characters.
export const storeNameSchema = z
  .string({ message: 'Enter a store name' })
  .transform(value => value.replace(/\s+/g, ' ').trim())
	.pipe(z.string().min(1, 'Enter a store name').max(100, 'Store name is too long'))
	.refine(value => storeNameKey(value) !== '', 'Include at least one letter or number in the store name')

export const createStoreSchema = z.object({
  name: storeNameSchema,
})

export const updateStoreSchema = z.object({
  name: storeNameSchema,
})

export const mergeStoresSchema = z.object({
  source_store_id: z.string().uuid('Choose a store to merge'),
})

export type CreateStoreInput = z.infer<typeof createStoreSchema>
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>
export type MergeStoresInput = z.infer<typeof mergeStoresSchema>
