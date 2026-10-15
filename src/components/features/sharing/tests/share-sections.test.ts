import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/types'

import { ShareCollaborators } from '../share-collaborators'
import { ShareInviteLink } from '../share-invite-link'

const noop = vi.fn()
const link = { id: 'inv1', invite_url: 'https://listys.app/invite/0y3FVk0ux4Qm2' } as InviteLinkWithUrl
const person = (overrides: Partial<CollaboratorWithProfile>) =>
	({ id: 'c1', user_id: 'u1', role: 'editor', display_name: 'Maya García', email: 'maya@example.com', avatar_initials: 'MG', ...overrides }) as CollaboratorWithProfile

describe('ShareInviteLink', () => {
	const render = (props: Partial<Parameters<typeof ShareInviteLink>[0]> = {}) =>
		renderToStaticMarkup(
			createElement(ShareInviteLink, { link: undefined, isLoading: false, isGenerating: false, onGenerate: noop, onRevoke: noop, ...props }),
		)

	it('offers to create the link when there is none', () => {
		const html = render()

		expect(html).toContain('data-testid="share-create-link"')
		expect(html).toContain('Create Link')
		expect(html).not.toContain('share-copy-link')
	})

	it('shows the link in a read-only mono field with Copy Link, Regenerate and Revoke', () => {
		const html = render({ link })

		expect(html).toContain('data-testid="share-link-url"')
		expect(html).toContain('truncate font-mono')
		expect(html).toContain('https://listys.app/invite/0y3FVk0ux4Qm2')
		expect(html).toContain('Copy Link')
		expect(html).toContain('Regenerate')
		expect(html).toContain('data-testid="share-revoke-link"')
		expect(html).not.toContain('Revoke this link?')
	})

	it('shows a skeleton while the sheet loads', () => {
		const html = render({ isLoading: true })

		expect(html).not.toContain('Create Link')
		expect(html).toContain('animate-pulse')
	})
})

describe('ShareCollaborators', () => {
	const render = (props: Partial<Parameters<typeof ShareCollaborators>[0]> = {}) =>
		renderToStaticMarkup(createElement(ShareCollaborators, { collaborators: [], isOwner: true, isLoading: false, onRemove: noop, ...props }))

	it('says nobody else has joined when the list has no collaborators', () => {
		const html = render()

		expect(html).toContain('No one else has joined yet.')
	})

	it('lists each person with their role chip and a remove control only for the owner’s guests', () => {
		const html = render({ collaborators: [person({ id: 'c0', user_id: 'u0', role: 'owner', display_name: 'Javier Tovar', avatar_initials: 'JT' }), person({})] })

		expect(html).toContain('data-testid="share-collaborator-u0"')
		expect(html).toContain('Owner')
		expect(html).toContain('Editor')
		expect(html).toContain('aria-label="Remove Maya García"')
		expect(html).not.toContain('aria-label="Remove Javier Tovar"')
	})

	it('shows no remove control to a collaborator who is not the owner', () => {
		expect(render({ isOwner: false, collaborators: [person({})] })).not.toContain('aria-label="Remove Maya García"')
	})
})
