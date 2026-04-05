import { describe, expect, it } from 'vitest'

import {
	formatCollaboratorRole,
	getCollaboratorDisplayName,
	getCollaboratorsEmptyStateMessage,
	getShareDialogBadges,
} from '@/components/features/sharing/share-list-dialog.utils'

describe('share-list-dialog utils', () => {
	it('builds summary badges for owners', () => {
		expect(
			getShareDialogBadges({
				isOwner: true,
				collaboratorsCount: 2,
				inviteLinksCount: 1,
			}),
		).toEqual(['2 collaborators', '1 active link'])
	})

	it('builds summary badges for collaborators', () => {
		expect(
			getShareDialogBadges({
				isOwner: false,
				collaboratorsCount: 1,
				inviteLinksCount: 3,
			}),
		).toEqual(['1 collaborator', 'Can edit'])
	})

	it('returns the owner empty state when invite links already exist', () => {
		expect(
			getCollaboratorsEmptyStateMessage({
				isOwner: true,
				inviteLinksCount: 2,
			}),
		).toBe('Invite links are ready. Once someone joins, they will appear here.')
	})

	it('prefers display name over email for collaborator labels', () => {
		expect(getCollaboratorDisplayName('Luis', 'luis@example.com')).toBe('Luis')
		expect(getCollaboratorDisplayName(null, 'luis@example.com')).toBe('luis@example.com')
		expect(getCollaboratorDisplayName(null, null)).toBe('Collaborator')
	})

	it('formats collaborator roles for display', () => {
		expect(formatCollaboratorRole('list_owner')).toBe('list owner')
	})
})
