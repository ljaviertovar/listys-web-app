import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional(),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
