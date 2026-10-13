import { describe, expect, it } from 'vitest'

import { avatarTone, formatCollaboratorRole, getCollaboratorDisplayName } from '../helpers/collaborator-display'

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

	it('gives a person the same avatar tint every time', () => {
		expect(avatarTone('user-1')).toBe(avatarTone('user-1'))
		expect(avatarTone('user-1')).toMatch(/^bg-[a-z]+-100 text-[a-z]+-700/)
	})
})
