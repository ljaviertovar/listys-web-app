/** Soft tints for the initials avatars (the 100 level fill with the 700 text), so people in a list are told apart without photos. */
const AVATAR_TONES = [
	'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
	'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
	'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
	'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
	'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
	'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
] as const

/** The same person always gets the same tint: it is picked from a stable seed (their user id), not from the order of the list. */
export function avatarTone(seed: string): string {
	let hash = 0
	for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
	return AVATAR_TONES[hash % AVATAR_TONES.length]
}

export function getCollaboratorDisplayName(displayName: string | null, email: string | null) {
	return displayName ?? email ?? 'Collaborator'
}

/** "editor" and "co_owner" read as "Editor" and "Co owner". */
export function formatCollaboratorRole(role: string) {
	const words = role.replaceAll('_', ' ')
	return words.charAt(0).toUpperCase() + words.slice(1)
}
