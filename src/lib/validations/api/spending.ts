import { z } from 'zod'

const isoDateTimeWithOffset = z.string().datetime({ offset: true }).refine(value => Number.isFinite(Date.parse(value)), 'Use a valid datetime with an offset')
const MAX_RANGE_MS = 92 * 24 * 60 * 60 * 1000

const timeZoneSchema = z.string().max(100).regex(/^[A-Za-z][A-Za-z0-9_+/-]*$/).refine(value => {
	try {
		new Intl.DateTimeFormat('en', { timeZone: value })
		return true
	} catch {
		return false
	}
}, 'Use a valid IANA time zone').transform(value => new Intl.DateTimeFormat('en', { timeZone: value }).resolvedOptions().timeZone)

/**
 * Either a bounded range (`from` and `to`, at most 92 days, with an optional range to compare it with) or `scope=all`, which reads every
 * receipt the user has and takes no dates. The bound exists for the first form so a range stays one cheap read; `scope=all` is paged by
 * the service instead.
 */
export const spendingQuerySchema = z.object({
	scope: z.literal('all').optional(),
	from: isoDateTimeWithOffset.optional(),
	to: isoDateTimeWithOffset.optional(),
	compare_from: isoDateTimeWithOffset.optional(),
	compare_to: isoDateTimeWithOffset.optional(),
	time_zone: timeZoneSchema.optional(),
}).strict().superRefine(({ scope, from, to, compare_from: compareFrom, compare_to: compareTo }, context) => {
	if (scope === 'all') {
		if (from || to || compareFrom || compareTo) {
			context.addIssue({ code: z.ZodIssueCode.custom, path: ['scope'], message: '`scope=all` takes no dates' })
		}
		return
	}
	if (!from) context.addIssue({ code: z.ZodIssueCode.custom, path: ['from'], message: '`from` is required' })
	if (!to) context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: '`to` is required' })
	if (!from || !to) return
	const start = Date.parse(from)
	const end = Date.parse(to)
	if (end <= start) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: '`to` must be after `from`' })
	}
	if (end - start > MAX_RANGE_MS) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: 'The requested range cannot exceed 92 days' })
	}
	if (Boolean(compareFrom) !== Boolean(compareTo)) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['compare_to'], message: 'Both comparison dates are required' })
	}
	if (compareFrom && compareTo && Date.parse(compareTo) <= Date.parse(compareFrom)) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['compare_to'], message: '`compare_to` must be after `compare_from`' })
	}
	if (compareFrom && compareTo && Date.parse(compareTo) - Date.parse(compareFrom) > MAX_RANGE_MS) {
		context.addIssue({ code: z.ZodIssueCode.custom, path: ['compare_to'], message: 'The comparison range cannot exceed 92 days' })
	}
})

export type SpendingQuery = z.infer<typeof spendingQuerySchema>
