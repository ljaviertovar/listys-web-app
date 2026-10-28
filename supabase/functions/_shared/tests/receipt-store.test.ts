import { describe, expect, it } from 'vitest'

import { MAX_STORE_NAME_LENGTH, parseOcrPayload, sanitizeReceiptTotal, sanitizeStoreName } from '../receipt-store.ts'

describe('sanitizeStoreName', () => {
	it('keeps a clean name', () => {
		expect(sanitizeStoreName('NO FRILLS #3127')).toBe('NO FRILLS #3127')
	})

	it('puts a multi-line, spaced-out name on one line', () => {
		expect(sanitizeStoreName('  NO\n FRILLS \t\r\n #3127  ')).toBe('NO FRILLS #3127')
	})

	it('removes control characters', () => {
		expect(sanitizeStoreName('Metro\u0000\u0007 Plus')).toBe('Metro Plus')
	})

	it('cuts names longer than the limit', () => {
		const result = sanitizeStoreName(`${'A'.repeat(MAX_STORE_NAME_LENGTH)} tail`)
		expect(result).toHaveLength(MAX_STORE_NAME_LENGTH)
	})

	it('does not end on a space after cutting', () => {
		const result = sanitizeStoreName(`${'A'.repeat(MAX_STORE_NAME_LENGTH - 1)} B`)
		expect(result).toBe('A'.repeat(MAX_STORE_NAME_LENGTH - 1))
	})

	it.each([null, undefined, 42, {}, [], '', '   \n '])('returns null for %p', value => {
		expect(sanitizeStoreName(value)).toBeNull()
	})
})

describe('parseOcrPayload', () => {
	const item = { name: 'Milk', quantity: 1, unit: 'unit', price: 2.5, category: null }

	it('reads the item array the functions used to receive', () => {
		expect(parseOcrPayload(JSON.stringify([item]))).toEqual({ items: [item], storeName: null, total: null })
	})

	it('reads the object with a store name', () => {
		expect(parseOcrPayload(JSON.stringify({ store_name: ' Walmart\nSupercentre ', items: [item] }))).toEqual({
			items: [item],
			storeName: 'Walmart Supercentre',
			total: null,
		})
	})

	it.each([
		['missing', { items: [item] }],
		['null', { store_name: null, items: [item] }],
		['a number', { store_name: 7, items: [item] }],
		['blank', { store_name: '  ', items: [item] }],
	])('keeps the items when the store name is %s', (_label, payload) => {
		expect(parseOcrPayload(JSON.stringify(payload))).toEqual({ items: [item], storeName: null, total: null })
	})

	it('returns no items when the object has none', () => {
		expect(parseOcrPayload(JSON.stringify({ store_name: 'Metro' }))).toEqual({ items: [], storeName: 'Metro', total: null })
	})

	it('returns nothing for other JSON values', () => {
		expect(parseOcrPayload('"text"')).toEqual({ items: [], storeName: null, total: null })
	})

	it('reads a total from the object while retaining array compatibility', () => {
		expect(parseOcrPayload(JSON.stringify({ store_name: 'Metro', total: 12.34, items: [item] }))).toEqual({
			items: [item],
			storeName: 'Metro',
			total: 12.34,
		})
		expect(parseOcrPayload(JSON.stringify([item])).total).toBeNull()
	})

	it('still throws on text that is not JSON, as before', () => {
		expect(() => parseOcrPayload('not json')).toThrow()
	})
})

describe('sanitizeReceiptTotal', () => {
	it.each([
		[12.5, 12.5],
		['12,50', 12.5],
		['12.50', 12.5],
		[1.236, 1.24],
		[' 0 ', 0],
	])('keeps valid total %p as %p', (raw, expected) => {
		expect(sanitizeReceiptTotal(raw)).toBe(expected)
	})

	it.each([-1, '-0.01', Number.NaN, Number.POSITIVE_INFINITY, 'not a total', '', null, undefined, {}, []])(
		'returns null for invalid total %p', raw => {
			expect(sanitizeReceiptTotal(raw)).toBeNull()
		},
	)
})
