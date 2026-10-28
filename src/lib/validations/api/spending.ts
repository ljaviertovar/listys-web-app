import { z } from 'zod'

const isoDateTimeWithOffset = z.string().datetime({ offset: true })

export const spendingQuerySchema = z.object({
	from: isoDateTimeWithOffset,
	to: isoDateTimeWithOffset,
}).strict().superRefine(({ from, to }, context) => {
	const start = Date.parse(from)
	const end = Date.parse(to)
	if (end <= start) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: '`to` must be after `from`' })
	}
	if (end - start > 92 * 24 * 60 * 60 * 1000) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: 'The requested range cannot exceed 92 days' })
	}
})

export type SpendingQuery = z.infer<typeof spendingQuerySchema>
