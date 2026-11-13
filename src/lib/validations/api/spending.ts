import { z } from 'zod'

const isoDateTimeWithOffset = z.string().datetime({ offset: true })

export const spendingQuerySchema = z.object({
	from: isoDateTimeWithOffset,
	to: isoDateTimeWithOffset,
	compare_from: isoDateTimeWithOffset.optional(),
	compare_to: isoDateTimeWithOffset.optional(),
}).strict().superRefine(({ from, to, compare_from: compareFrom, compare_to: compareTo }, context) => {
	const start = Date.parse(from)
	const end = Date.parse(to)
	if (end <= start) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: '`to` must be after `from`' })
	}
	if (end - start > 92 * 24 * 60 * 60 * 1000) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: 'The requested range cannot exceed 92 days' })
	}
	if (Boolean(compareFrom) !== Boolean(compareTo)) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['compare_to'], message: 'Both comparison dates are required' })
	}
	if (compareFrom && compareTo && Date.parse(compareTo) <= Date.parse(compareFrom)) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['compare_to'], message: '`compare_to` must be after `compare_from`' })
	}
	if (compareFrom && compareTo && Date.parse(compareTo) - Date.parse(compareFrom) > 92 * 24 * 60 * 60 * 1000) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['compare_to'], message: 'The comparison range cannot exceed 92 days' })
	}
})

export type SpendingQuery = z.infer<typeof spendingQuerySchema>
