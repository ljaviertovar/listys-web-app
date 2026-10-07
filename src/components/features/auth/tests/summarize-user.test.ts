import { describe, expect, it } from 'vitest'

import { summarizeUser } from '@/components/app/helpers/summarize-user'

describe('summarizeUser', () => {
	it('uses the profile name, with the first and last initials', () => {
		expect(summarizeUser({ email: 'a@b.com', user_metadata: { full_name: 'Javier Tovar' } })).toMatchObject({
			name: 'Javier Tovar',
			initials: 'JT',
			email: 'a@b.com',
		})
	})

	it('falls back to the email name and its first two letters', () => {
		expect(summarizeUser({ email: 'maya@example.com' })).toMatchObject({ name: 'maya', initials: 'MA' })
	})

	it('reads the avatar from either provider field and is null without one', () => {
		expect(summarizeUser({ user_metadata: { avatar_url: 'https://x/y.png' } }).avatarUrl).toBe('https://x/y.png')
		expect(summarizeUser({ user_metadata: { picture: 'https://x/z.png' } }).avatarUrl).toBe('https://x/z.png')
		expect(summarizeUser({}).avatarUrl).toBeNull()
	})

	it('never returns an empty name', () => {
		expect(summarizeUser({}).name).toBe('User')
	})
})
