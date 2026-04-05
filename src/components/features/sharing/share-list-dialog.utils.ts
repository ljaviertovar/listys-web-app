type ShareListDialogMeta = {
	isOwner: boolean
	collaboratorsCount: number
	inviteLinksCount: number
}

type CollaboratorsEmptyStateMeta = {
	isOwner: boolean
	inviteLinksCount: number
}

export function getShareDialogBadges({
	isOwner,
	collaboratorsCount,
	inviteLinksCount,
}: ShareListDialogMeta) {
	const badges = [`${collaboratorsCount} ${collaboratorsCount === 1 ? 'collaborator' : 'collaborators'}`]

	if (isOwner) {
		badges.push(`${inviteLinksCount} ${inviteLinksCount === 1 ? 'active link' : 'active links'}`)
	} else {
		badges.push('Can edit')
	}

	return badges
}

export function getCollaboratorsEmptyStateMessage({
	isOwner,
	inviteLinksCount,
}: CollaboratorsEmptyStateMeta) {
	if (!isOwner) {
		return 'No collaborators are visible yet.'
	}

	if (inviteLinksCount > 0) {
		return 'Invite links are ready. Once someone joins, they will appear here.'
	}

	return 'No collaborators yet. Share an invite link to add people.'
}

export function getCollaboratorDisplayName(displayName: string | null, email: string | null) {
	return displayName ?? email ?? 'Collaborator'
}

export function formatCollaboratorRole(role: string) {
	return role.replaceAll('_', ' ')
}
