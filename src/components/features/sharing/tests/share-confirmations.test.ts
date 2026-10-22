import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/types'

type CapturedConfirmation = {
	open: boolean
	title: string
	description?: string
	testId: string
	onOpenChange: (open: boolean) => void
	onConfirm: () => void | Promise<void>
}

const fixtures = vi.hoisted(() => ({
	confirmation: null as CapturedConfirmation | null,
}))

vi.mock('@/components/commons', async () => {
	const React = await import('react')
	return {
		ConfirmSheet: (props: {
			open: boolean
			title: string
			description?: string
			testId: string
			onOpenChange: (open: boolean) => void
			onConfirm: () => void | Promise<void>
		}) => {
			fixtures.confirmation = props
			return React.createElement('div', { 'data-testid': props.testId, 'data-open': props.open })
		},
	}
})

import { ShareCollaborators } from '../share-collaborators'
import { ShareInviteLink } from '../share-invite-link'

const invite = { id: 'fixture-invite', invite_url: 'https://example.test/invite/fixture' } as InviteLinkWithUrl
const collaborator = {
	id: 'fixture-collaboration',
	user_id: 'fixture-user',
	role: 'editor',
	display_name: 'Fixture Guest',
	email: 'guest@example.test',
	avatar_initials: 'FG',
} as CollaboratorWithProfile

describe('share confirmations with local fixtures', () => {
	it('keeps link revocation behind the confirmation and explains its actual effect', async () => {
		const onRevoke = vi.fn().mockResolvedValue(true)
		fixtures.confirmation = null
		const html = renderToStaticMarkup(createElement(ShareInviteLink, {
			link: invite,
			isLoading: false,
			isGenerating: false,
			onGenerate: vi.fn(),
			onRevoke,
		}))
		const confirmation = fixtures.confirmation as CapturedConfirmation | null

		expect(html).toContain('data-testid="share-revoke-confirm"')
		expect(confirmation).not.toBeNull()
		expect(confirmation?.open).toBe(false)
		expect(confirmation?.title).toBe('Revoke this link?')
		expect(confirmation?.description).toContain('People who already joined keep their access')
		expect(onRevoke).not.toHaveBeenCalled()

		confirmation?.onOpenChange(false)
		expect(onRevoke).not.toHaveBeenCalled()
		await confirmation?.onConfirm()
		expect(onRevoke).toHaveBeenCalledOnce()
		expect(onRevoke).toHaveBeenCalledWith('fixture-invite')
	})

	it('keeps guest removal behind its confirmation and explains access ends immediately', async () => {
		const onRemove = vi.fn().mockResolvedValue(true)
		fixtures.confirmation = null
		const html = renderToStaticMarkup(createElement(ShareCollaborators, {
			collaborators: [collaborator],
			isOwner: true,
			isLoading: false,
			onRemove,
		}))
		const confirmation = fixtures.confirmation as CapturedConfirmation | null

		expect(html).toContain('data-testid="share-remove-collaborator-fixture-user"')
		expect(confirmation).not.toBeNull()
		expect(confirmation?.open).toBe(false)
		expect(confirmation?.title).toBe('Remove Fixture Guest?')
		expect(confirmation?.description).toBe('Access to this list ends right away. They can join again with the link.')
		expect(onRemove).not.toHaveBeenCalled()

		confirmation?.onOpenChange(false)
		expect(onRemove).not.toHaveBeenCalled()
		await confirmation?.onConfirm()
		expect(onRemove).toHaveBeenCalledOnce()
		expect(onRemove).toHaveBeenCalledWith('fixture-user')
	})
})
