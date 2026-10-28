import { describe, expect, it } from 'vitest'

import { formatCollaboratorRole, getCollaboratorDisplayName } from '../helpers/collaborator-display'

describe('collaborator display', () => {
	it('prefers the display name over the email, and falls back to a neutral label', () => {
		expect(getCollaboratorDisplayName('Maya García', 'maya@example.com')).toBe('Maya García')
		expect(getCollaboratorDisplayName(null, 'maya@example.com')).toBe('maya@example.com')
		expect(getCollaboratorDisplayName(null, null)).toBe('Collaborator')
	})

	it('writes a role as a capitalised word', () => {
		expect(formatCollaboratorRole('editor')).toBe('Editor')
		expect(formatCollaboratorRole('co_owner')).toBe('Co owner')
	})
})
