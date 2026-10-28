import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CollaboratorWithProfile } from '@/types'

import { ShareCollaborators } from '../share-collaborators'

const noop = vi.fn()
const person = (overrides: Partial<CollaboratorWithProfile>) =>
	({ id: 'c1', user_id: 'u1', role: 'editor', display_name: 'Maya García', email: 'maya@example.com', avatar_initials: 'MG', ...overrides }) as CollaboratorWithProfile

describe('ShareCollaborators', () => {
	const render = (props: Partial<Parameters<typeof ShareCollaborators>[0]> = {}) =>
		renderToStaticMarkup(createElement(ShareCollaborators, { collaborators: [], isOwner: true, isLoading: false, onRemove: noop, ...props }))

	it('offers a remove control only for the owner’s guests, never for the owner', () => {
		const html = render({ collaborators: [person({ id: 'c0', user_id: 'u0', role: 'owner', display_name: 'Javier Tovar', avatar_initials: 'JT' }), person({})] })

		expect(html).toContain('aria-label="Remove Maya García"')
		expect(html).not.toContain('aria-label="Remove Javier Tovar"')
	})

	it('shows no remove control to a collaborator who is not the owner', () => {
		expect(render({ isOwner: false, collaborators: [person({})] })).not.toContain('aria-label="Remove Maya García"')
	})
})
