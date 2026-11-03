import { describe, expect, it } from 'vitest'

import { resolveSessionBackLink } from '../helpers/resolve-session-back-link'

describe('resolveSessionBackLink', () => {
	it('returns to the trips with the list they were narrowed to', () => {
		expect(resolveSessionBackLink('trips', 'list-1')).toEqual({ href: '/trips?list=list-1', label: 'Back to Trips' })
	})

	it('returns to all trips when they were not narrowed', () => {
		expect(resolveSessionBackLink('trips')).toEqual({ href: '/trips', label: 'Back to Trips' })
	})

	it('encodes the list so it cannot add query parameters', () => {
		expect(resolveSessionBackLink('trips', 'a&x=1').href).toBe('/trips?list=a%26x%3D1')
	})

	it('still opens the trips from links made before the section was renamed', () => {
		expect(resolveSessionBackLink('history', 'list-1')).toEqual({ href: '/trips?list=list-1', label: 'Back to Trips' })
		expect(resolveSessionBackLink('history')).toEqual({ href: '/trips', label: 'Back to Trips' })
	})

	it('sends the old group origin to all trips', () => {
		expect(resolveSessionBackLink('history-group', 'list-1')).toEqual({ href: '/trips', label: 'Back to Trips' })
	})

	it('goes to the lists in any other case', () => {
		expect(resolveSessionBackLink()).toEqual({ href: '/shopping-lists', label: 'Back to Lists' })
		expect(resolveSessionBackLink('list-editor')).toEqual({ href: '/shopping-lists', label: 'Back to Lists' })
	})
})
