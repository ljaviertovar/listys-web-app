import { describe, expect, it } from 'vitest'

import { formatItemName } from '@/utils/format-item-name'

describe('formatItemName', () => {
	it('puts a name printed in capitals in Title Case', () => {
		expect(formatItemName('PC MINI TORTILLA')).toBe('PC Mini Tortilla')
		expect(formatItemName('BANANA ORGANIC')).toBe('Banana Organic')
	})

	it('keeps short codes in capitals and weights in lowercase', () => {
		expect(formatItemName('BD SNK MRB CHDR')).toBe('BD Snk Mrb Chdr')
		expect(formatItemName('GREEK YOGURT 500G')).toBe('Greek Yogurt 500g')
	})

	it('leaves a name that already has lowercase letters alone', () => {
		expect(formatItemName('Mom’s Salsa')).toBe('Mom’s Salsa')
	})
})
