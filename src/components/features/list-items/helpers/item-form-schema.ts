import { z } from 'zod'

/** Largest quantity an item can carry; the API enforces the same limit. */
export const MAX_ITEM_QUANTITY = 99

/**
 * What the item forms (add and edit, in a base list and in a shopping session) validate. The messages are the ones the
 * form shows under its fields, so they read the same on every screen.
 */
export const itemFormSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
	quantity: z
		.number({ error: 'Quantity is required' })
		.min(0.1, 'Must be above 0')
		.max(MAX_ITEM_QUANTITY, `Cannot exceed ${MAX_ITEM_QUANTITY}`)
		.refine(n => Math.round(n * 10) === n * 10, 'Use steps of 0.1'),
	unit: z.string().min(1, 'Unit is required').max(20),
	category: z.string().max(50).optional(),
	notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

export type ItemFormValues = z.infer<typeof itemFormSchema>

/** The units a form offers, plus the item's own when it came from somewhere else (a receipt writes "unit", a list "L"). */
export function unitOptions(units: readonly string[], current?: string | null): string[] {
	return current && !units.includes(current) ? [current, ...units] : [...units]
}
