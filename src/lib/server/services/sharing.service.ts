import { randomBytes } from 'crypto'

import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { createInviteLinkSchema } from '@/lib/validations/sharing'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/features/sharing/types'

// Generates a cryptographically random URL-safe token
function generateInviteToken(): string {
  return randomBytes(24).toString('base64url')
}

function buildInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return `${baseUrl}/invite/${token}`
}

async function assertListOwner(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, baseListId: string, userId: string) {
  const { data: list } = await supabase
    .from('base_lists')
    .select('id')
    .eq('id', baseListId)
    .eq('user_id', userId)
    .single()

  if (!list) {
    throw new ApiServiceError(403, ErrorCode.UNAUTHORIZED, 'Only the list owner can manage sharing settings')
  }
}

// ---------------------------------------------------------------------------
// INVITE LINKS
// ---------------------------------------------------------------------------

export async function createInviteLink(baseListId: string, data: unknown): Promise<InviteLinkWithUrl> {
  const { supabase, user } = await createAuthenticatedClient()

  const validation = createInviteLinkSchema.safeParse(data)
  if (!validation.success) {
    throw new ApiServiceError(422, ErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message ?? 'Invalid payload')
  }

  await assertListOwner(supabase, baseListId, user.id)

  // Enforce one active link per list — revoke any existing active link first
  await supabase
    .from('list_invite_links')
    .update({ is_active: false })
    .eq('base_list_id', baseListId)
    .eq('is_active', true)

  const token = generateInviteToken()
  const expiresAt = validation.data.expires_in_days
    ? new Date(Date.now() + validation.data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { data: inviteLink, error } = await supabase
    .from('list_invite_links')
    .insert({
      base_list_id: baseListId,
      token,
      created_by: user.id,
      expires_at: expiresAt,
      max_uses: validation.data.max_uses ?? null,
    })
    .select()
    .single()

  if (error || !inviteLink) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error?.message ?? 'Failed to create invite link')
  }

  return { ...inviteLink, invite_url: buildInviteUrl(inviteLink.token) }
}

export async function listInviteLinks(baseListId: string): Promise<InviteLinkWithUrl[]> {
  const { supabase, user } = await createAuthenticatedClient()

  await assertListOwner(supabase, baseListId, user.id)

  const { data, error } = await supabase
    .from('list_invite_links')
    .select('*')
    .eq('base_list_id', baseListId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  return (data ?? []).map(link => ({ ...link, invite_url: buildInviteUrl(link.token) }))
}

export async function revokeInviteLink(baseListId: string, inviteId: string): Promise<void> {
  const { supabase, user } = await createAuthenticatedClient()

  await assertListOwner(supabase, baseListId, user.id)

  const { error } = await supabase
    .from('list_invite_links')
    .update({ is_active: false })
    .eq('id', inviteId)
    .eq('base_list_id', baseListId)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }
}

/** Accept an invite by token. Returns the list and active session info for redirect UX. */
export async function acceptInvite(token: string): Promise<{ base_list_id: string; list_name: string; active_session_id?: string }> {
  const { user } = await createAuthenticatedClient()
  // Use admin client for all operations: the invitee has no RLS access yet to
  // base_lists or list_collaborators until after they are added as a collaborator.
  const admin = createAdminClient()

  // Look up the invite link (no join — admin bypasses list_invite_links RLS too,
  // but the actual invite token lookup doesn't need user context)
  const { data: inviteLink, error: linkError } = await admin
    .from('list_invite_links')
    .select('id, base_list_id, created_by, expires_at, max_uses, use_count, is_active')
    .eq('token', token)
    .eq('is_active', true)
    .single()

  if (linkError || !inviteLink) {
    throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Invite link not found or has been revoked')
  }

  // Check expiry
  if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
    throw new ApiServiceError(410, ErrorCode.BAD_REQUEST, 'This invite link has expired')
  }

  // Check use limit
  if (inviteLink.max_uses !== null && inviteLink.use_count >= inviteLink.max_uses) {
    throw new ApiServiceError(410, ErrorCode.BAD_REQUEST, 'This invite link has reached its maximum number of uses')
  }

  // Resolve the base list bypassing RLS (invitee not yet a collaborator)
  const { data: baseList, error: listError } = await admin
    .from('base_lists')
    .select('id, name, user_id')
    .eq('id', inviteLink.base_list_id)
    .single()

  if (listError || !baseList) {
    throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'The shared list no longer exists')
  }

  // Owner accepting their own invite is a no-op
  if (baseList.user_id === user.id) {
    const activeSession = await resolveActiveSession(admin, baseList.id)
    return { base_list_id: baseList.id, list_name: baseList.name, active_session_id: activeSession ?? undefined }
  }

  // Idempotent: skip insert if already a collaborator
  const { data: existing } = await admin
    .from('list_collaborators')
    .select('id')
    .eq('base_list_id', baseList.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    // Insert bypasses RLS (INSERT policy only allows owner; we verify via invite link instead)
    const { error: insertError } = await admin
      .from('list_collaborators')
      .insert({
        base_list_id: baseList.id,
        user_id: user.id,
        invited_by: inviteLink.created_by,
        role: 'editor',
      })

    if (insertError) {
      throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, insertError.message)
    }

    // Increment use count
    await admin
      .from('list_invite_links')
      .update({ use_count: inviteLink.use_count + 1 })
      .eq('id', inviteLink.id)
  }

  const activeSession = await resolveActiveSession(admin, baseList.id)
  return { base_list_id: baseList.id, list_name: baseList.name, active_session_id: activeSession ?? undefined }
}

/** Returns the ID of the active shopping session for a list, if any. */
async function resolveActiveSession(admin: ReturnType<typeof createAdminClient>, baseListId: string): Promise<string | null> {
  const { data } = await admin
    .from('shopping_sessions')
    .select('id')
    .eq('base_list_id', baseListId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// COLLABORATORS
// ---------------------------------------------------------------------------

export async function listCollaborators(baseListId: string): Promise<CollaboratorWithProfile[]> {
  const { supabase, user } = await createAuthenticatedClient()

  // Accessible to both owners and collaborators (RLS enforces this)
  const { data: list } = await supabase
    .from('base_lists')
    .select('id')
    .eq('id', baseListId)
    .single()

  if (!list) {
    throw new ApiServiceError(404, ErrorCode.NOT_FOUND, 'List not found')
  }

  const { data, error } = await supabase
    .from('list_collaborators')
    .select('*')
    .eq('base_list_id', baseListId)
    .order('joined_at', { ascending: true })

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }

  // Resolve display info via auth.users metadata where available
  // We only have access to the current user's metadata via auth.getUser();
  // for other users we fall back to partial info stored in collaborator rows
  return (data ?? []).map(c => {
    const isCurrentUser = c.user_id === user.id
    return {
      ...c,
      display_name: isCurrentUser ? (user.user_metadata?.full_name ?? null) : null,
      email: isCurrentUser ? (user.email ?? null) : null,
      avatar_initials: deriveInitials(isCurrentUser ? (user.user_metadata?.full_name ?? user.email) : c.user_id),
    }
  })
}

export async function removeCollaborator(baseListId: string, targetUserId: string): Promise<void> {
  const { supabase, user } = await createAuthenticatedClient()

  // Must be owner or the collaborator themselves
  const isOwner = await supabase
    .from('base_lists')
    .select('id')
    .eq('id', baseListId)
    .eq('user_id', user.id)
    .maybeSingle()
    .then(r => !!r.data)

  const isSelf = targetUserId === user.id

  if (!isOwner && !isSelf) {
    throw new ApiServiceError(403, ErrorCode.UNAUTHORIZED, 'Only the list owner or the collaborator themselves can remove access')
  }

  const { error } = await supabase
    .from('list_collaborators')
    .delete()
    .eq('base_list_id', baseListId)
    .eq('user_id', targetUserId)

  if (error) {
    throw new ApiServiceError(500, ErrorCode.INTERNAL_ERROR, error.message)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveInitials(value: string | null | undefined): string {
  if (!value) return '?'
  const parts = value.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return value.slice(0, 2).toUpperCase()
}
