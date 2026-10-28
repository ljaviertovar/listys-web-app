import { describe, expect, it } from 'vitest'

import { suggestStoreName } from '../helpers/suggest-store-name'

describe('suggestStoreName', () => {
	it('drops a # branch number and turns capitals into Title Case', () => {
		expect(suggestStoreName('NO FRILLS #3127')).toBe('No Frills')
		expect(suggestStoreName('Fresh Co #12')).toBe('Fresh Co')
	})

	it('drops a trailing branch number of three or more digits but keeps short numbers', () => {
		expect(suggestStoreName('METRO 1024')).toBe('Metro')
		expect(suggestStoreName('Shop 24')).toBe('Shop 24')
	})

	it('keeps a name that mixes cases as written', () => {
		expect(suggestStoreName('Walmart Supercentre')).toBe('Walmart Supercentre')
		expect(suggestStoreName('FreshCo')).toBe('FreshCo')
	})

	it('turns an all-lowercase name (a logo read by OCR) into Title Case', () => {
		expect(suggestStoreName('metro')).toBe('Metro')
		expect(suggestStoreName('no frills #12')).toBe('No Frills')
	})

	it.each([null, undefined, '', '   ', '#123'])('proposes nothing for %p', raw => {
		expect(suggestStoreName(raw)).toBe('')
	})
})
