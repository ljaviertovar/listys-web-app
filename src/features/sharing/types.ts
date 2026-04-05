import { Database } from '@/lib/supabase/database.types'

export type ListCollaborator = Database['public']['Tables']['list_collaborators']['Row']
export type InsertListCollaborator = Database['public']['Tables']['list_collaborators']['Insert']

export type ListInviteLink = Database['public']['Tables']['list_invite_links']['Row']
export type InsertListInviteLink = Database['public']['Tables']['list_invite_links']['Insert']
export type UpdateListInviteLink = Database['public']['Tables']['list_invite_links']['Update']

export type ShoppingSessionParticipant = Database['public']['Tables']['shopping_session_participants']['Row']
export type InsertShoppingSessionParticipant = Database['public']['Tables']['shopping_session_participants']['Insert']
export type UpdateShoppingSessionParticipant = Database['public']['Tables']['shopping_session_participants']['Update']

/** Collaborator enriched with display info resolved at the app layer */
export type CollaboratorWithProfile = ListCollaborator & {
  display_name: string | null
  email: string | null
  avatar_initials: string
}

/** Invite link enriched with the full shareable URL */
export type InviteLinkWithUrl = ListInviteLink & {
  invite_url: string
}
