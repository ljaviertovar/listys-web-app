import { z } from 'zod'

export const uuidParamsSchema = z.object({
  id: z.string().uuid(),
})

export const groupIdParamsSchema = z.object({
  groupId: z.string().uuid(),
})

export const baseListIdParamsSchema = z.object({
  baseListId: z.string().uuid(),
})

export const itemIdParamsSchema = z.object({
  itemId: z.string().uuid(),
})

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().uuid(),
})

export const ticketIdParamsSchema = z.object({
  ticketId: z.string().uuid(),
})

export const shoppingSessionsQuerySchema = z.object({
  status: z.enum(['completed', 'active']).optional(),
})

export const inviteIdParamsSchema = z.object({
  inviteId: z.string().uuid(),
})

export const collaboratorUserIdParamsSchema = z.object({
  userId: z.string().uuid(),
})
