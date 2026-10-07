import { describe, expect, it } from 'vitest'

import { checkIsActive } from '@/components/app/sidebar/helpers/check-is-active'

const dashboard = { title: 'Dashboard', url: '/dashboard' }

describe('checkIsActive', () => {
	it('matches the current path, with or without a query string', () => {
		expect(checkIsActive('/dashboard', dashboard)).toBe(true)
		expect(checkIsActive('/dashboard?tab=1', dashboard)).toBe(true)
	})

	it('does not match another section', () => {
		expect(checkIsActive('/tickets', dashboard)).toBe(false)
		expect(checkIsActive('/dashboard-old', dashboard)).toBe(false)
	})

	it('treats a section as active when one of its children is the current page', () => {
		const group = { title: 'Settings', items: [{ title: 'Profile', url: '/settings/profile' }] }

		expect(checkIsActive('/settings/profile', group)).toBe(true)
		expect(checkIsActive('/settings/account', group)).toBe(false)
	})

	it('matches by first path segment only for main navigation', () => {
		const lists = { title: 'Lists', url: '/shopping-lists' }

		expect(checkIsActive('/shopping-lists/g1/lists', lists, true)).toBe(true)
		expect(checkIsActive('/shopping-lists/g1/lists', lists)).toBe(false)
	})
})
