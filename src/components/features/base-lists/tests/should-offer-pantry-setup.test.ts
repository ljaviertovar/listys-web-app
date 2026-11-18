import { describe, it, expect } from 'vitest'

import { shouldOfferPantrySetup } from '../helpers/should-offer-pantry-setup'

describe('shouldOfferPantrySetup', () => {
	it('is offered to an account known to have no default list', () => {
		expect(shouldOfferPantrySetup({ queryFailed: false, defaultListId: null })).toBe(true)
	})

	it('is not offered once the account has a default list', () => {
		expect(shouldOfferPantrySetup({ queryFailed: false, defaultListId: 'list-1' })).toBe(false)
	})

	it('is not offered when the default list could not be looked up', () => {
		expect(shouldOfferPantrySetup({ queryFailed: true, defaultListId: null })).toBe(false)
	})
})
