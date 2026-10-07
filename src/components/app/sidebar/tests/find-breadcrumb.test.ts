import { describe, expect, it } from 'vitest'

import { findBreadcrumb } from '@/components/app/sidebar/helpers/find-breadcrumb'
import { SIDEBAR_DATA } from '@/data/constants'

const find = (pathname: string) => findBreadcrumb(pathname, SIDEBAR_DATA.navGroups)

describe('findBreadcrumb', () => {
	it('names the section and the entry of a page in the navigation', () => {
		expect(find('/dashboard')).toEqual({ section: 'Shopping', page: 'Dashboard' })
		expect(find('/tickets')).toEqual({ section: 'Management', page: 'Receipts' })
		expect(find('/settings/account')).toEqual({ section: 'Settings', page: 'Account' })
	})

	it('files pages below an entry under it', () => {
		expect(find('/shopping-lists/abc/lists')).toEqual({ section: 'Shopping', page: 'Shopping List Groups' })
	})

	it('does not match a different route that merely starts with the same letters', () => {
		expect(find('/ticketsx')).toBeNull()
	})

	it('has no breadcrumb for pages outside the navigation', () => {
		expect(find('/shopping/s1')).toBeNull()
		expect(find('/')).toBeNull()
	})
})
