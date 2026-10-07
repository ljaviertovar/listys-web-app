export interface UserSummary {
	name: string
	email: string
	/** Two letters for the avatar fallback. */
	initials: string
	avatarUrl: string | null
}

interface UserLike {
	email?: string | null
	user_metadata?: Record<string, unknown> | null
}

/** The name, email and avatar the account row shows, from a Supabase user (the same fallbacks as the header's user menu). */
export function summarizeUser(user: UserLike): UserSummary {
	const metadata = user.user_metadata ?? {}
	const email = user.email ?? ''
	const name = ((metadata.name as string | undefined) || (metadata.full_name as string | undefined) || email.split('@')[0] || 'User').trim()
	const words = name.split(/\s+/).filter(Boolean)
	const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2)).toUpperCase()
	const avatarUrl = (metadata.avatar_url as string | undefined) || (metadata.picture as string | undefined) || null

	return { name, email, initials, avatarUrl }
}
