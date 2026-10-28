import { z } from 'zod'

export const likelyNeededQuerySchema = z.object({
	filter: z.literal('likely_needed'),
	limit: z.coerce.number().int().min(1).max(10).default(5),
}).strict()
