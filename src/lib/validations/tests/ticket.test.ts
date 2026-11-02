import { describe, expect, it } from 'vitest'

import { uploadTicketFieldsSchema, uploadTicketSchema } from '../ticket'
import { storeNameSchema } from '../store'

const photo = () => new File(['photo'], 'receipt.jpg', { type: 'image/jpeg' })

describe('uploadTicketSchema (the upload form)', () => {
	it('needs only photos: the store is read from the receipt', () => {
		expect(uploadTicketSchema.safeParse({ files: [photo()] }).success).toBe(true)
	})

	it('still needs at least one photo', () => {
		expect(uploadTicketSchema.safeParse({ files: [] }).success).toBe(false)
	})
})

describe('uploadTicketFieldsSchema (server-side upload fields)', () => {
	it.each([null, undefined, '', '   '])('treats %p as no store name', value => {
		expect(uploadTicketFieldsSchema.parse({ store_name: value })).toEqual({ store_name: undefined })
	})

	it('collapses whitespace in a store name', () => {
		expect(uploadTicketFieldsSchema.parse({ store_name: ' Corner \n Market ' })).toEqual({ store_name: 'Corner Market' })
	})

	it('rejects a store name over 100 characters, and a file sent as the name', () => {
		expect(uploadTicketFieldsSchema.safeParse({ store_name: 'x'.repeat(101) }).success).toBe(false)
		expect(uploadTicketFieldsSchema.safeParse({ store_name: photo() }).success).toBe(false)
	})

	const tripId = '0d6f4b0e-2a64-4f6a-9d3e-6c3b2c8d1a11'

	it.each([null, undefined, '', '  '])('treats %p as an upload from no trip', value => {
		expect(uploadTicketFieldsSchema.parse({ shopping_session_id: value }).shopping_session_id).toBeUndefined()
	})

	it('keeps the trip the upload started from', () => {
		expect(uploadTicketFieldsSchema.parse({ shopping_session_id: tripId }).shopping_session_id).toBe(tripId)
	})

	it('rejects a trip that is not an id', () => {
		expect(uploadTicketFieldsSchema.safeParse({ shopping_session_id: 'my-trip' }).success).toBe(false)
		expect(uploadTicketFieldsSchema.safeParse({ shopping_session_id: photo() }).success).toBe(false)
	})
})

describe('storeNameSchema', () => {
	it('collapses whitespace and keeps 1 to 100 characters', () => {
		expect(storeNameSchema.parse('  No   Frills ')).toBe('No Frills')
		expect(storeNameSchema.safeParse('   ').success).toBe(false)
		expect(storeNameSchema.safeParse('x'.repeat(101)).success).toBe(false)
		expect(storeNameSchema.safeParse('x'.repeat(100)).success).toBe(true)
	})
})
