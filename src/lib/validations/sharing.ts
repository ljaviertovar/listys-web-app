import { z } from 'zod'

export const createInviteLinkSchema = z.object({
  expires_in_days: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional()
    .describe('Optional: number of days until link expires (1–30)'),
  max_uses: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Optional: maximum number of times the link can be used'),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const tokenParamsSchema = z.object({
  token: z.string().min(1),
})

export const inviteIdParamsSchema = z.object({
  inviteId: z.string().uuid(),
})

export const collaboratorUserIdParamsSchema = z.object({
  userId: z.string().uuid(),
})

export type CreateInviteLinkInput = z.infer<typeof createInviteLinkSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
