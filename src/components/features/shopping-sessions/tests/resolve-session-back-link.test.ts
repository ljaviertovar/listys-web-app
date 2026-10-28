import { describe, expect, it } from 'vitest'

import { resolveSessionBackLink } from '../helpers/resolve-session-back-link'

describe('resolveSessionBackLink', () => {
	it('returns to the history with the list it was narrowed to', () => {
		expect(resolveSessionBackLink('history', 'list-1')).toEqual({ href: '/shopping-history?list=list-1', label: 'Back to Shopping History' })
	})

	it('returns to the whole history otherwise', () => {
		expect(resolveSessionBackLink('history')).toEqual({ href: '/shopping-history', label: 'Back to Shopping History' })
	})

	it('encodes the list so it cannot add parameters of its own', () => {
		expect(resolveSessionBackLink('history', 'a&x=1').href).toBe('/shopping-history?list=a%26x%3D1')
	})

	it('treats the origin of links made before groups were hidden as the history, without a list', () => {
		expect(resolveSessionBackLink('history-group', 'list-1')).toEqual({ href: '/shopping-history', label: 'Back to Shopping History' })
	})

	it('goes to the lists when there is no origin or an unknown one', () => {
		expect(resolveSessionBackLink()).toEqual({ href: '/shopping-lists', label: 'Back to Lists' })
		expect(resolveSessionBackLink('dashboard', 'list-1')).toEqual({ href: '/shopping-lists', label: 'Back to Lists' })
	})
})
