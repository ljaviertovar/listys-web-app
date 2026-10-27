import { describe, expect, it } from 'vitest'

import type { Store } from '@/types'

import { canCreateStore, filterStores, pickerStatus, storeNameKey } from '../helpers/filter-stores'

const store = (id: string, name: string): Store => ({ id, name, receipt_count: 0, created_at: '', updated_at: '' })
const stores = [store('1', 'No Frills'), store('2', 'Metro'), store('3', 'Food Basics')]

describe('filterStores', () => {
	it('returns every store for an empty search', () => {
		expect(filterStores(stores, '  ')).toHaveLength(3)
	})

	it('matches part of a name, ignoring case and extra spaces', () => {
		expect(filterStores(stores, 'no   FR').map(s => s.id)).toEqual(['1'])
		expect(filterStores(stores, 'o').map(s => s.id)).toEqual(['1', '2', '3'])
	})

	it('leaves out the excluded store (the one being merged)', () => {
		expect(filterStores(stores, '', '2').map(s => s.id)).toEqual(['1', '3'])
	})
})

describe('canCreateStore', () => {
	it('offers a new store for a name no store has', () => {
		expect(canCreateStore(stores, 'Fresh Co')).toBe(true)
	})

	it('does not offer a store that already exists or an empty name', () => {
		expect(canCreateStore(stores, '  no frills ')).toBe(false)
		expect(canCreateStore(stores, '   ')).toBe(false)
	})

	it('does not offer a name longer than 100 characters', () => {
		expect(canCreateStore(stores, 'x'.repeat(101))).toBe(false)
	})
})

describe('storeNameKey (same examples as normalize_store_name)', () => {
	it.each(['No Frills', 'NOFRILLS', 'no frills #123', 'No Frills 3127'])('reads %p as nofrills', name => {
		expect(storeNameKey(name)).toBe('nofrills')
	})

	it('ignores accents and punctuation, keeps short trailing numbers, and has no key for a bare branch number', () => {
		expect(storeNameKey('Épicerie  Ñ-Market!')).toBe('epicerienmarket')
		expect(storeNameKey('Shop 24')).toBe('shop24')
		expect(storeNameKey('#123')).toBe('')
	})
})

describe('store name variants', () => {
	const withB = [...stores, store('4', 'Fase3 Tienda B')]

	it('does not offer to create a variant of an existing name', () => {
		expect(canCreateStore(withB, 'FASE3-TIENDA B #123')).toBe(false)
		expect(canCreateStore(withB, '#123')).toBe(false)
	})

	it('finds the existing store when searching for a variant', () => {
		expect(filterStores(withB, 'FASE3-TIENDA B #123').map(s => s.id)).toEqual(['4'])
		expect(filterStores(withB, 'NOFRILLS #3127').map(s => s.id)).toEqual(['1'])
	})
})

describe('pickerStatus', () => {
	it('says there are no stores, or no other stores, instead of "no match" when there is nothing to pick', () => {
		expect(pickerStatus({ total: 0, others: 0, matches: 0, allowCreate: true })).toBe('You have no stores yet. Type a name to create the first one.')
		expect(pickerStatus({ total: 1, others: 0, matches: 0, allowCreate: true })).toBe('You have no other stores. Type a name to create one.')
		expect(pickerStatus({ total: 1, others: 0, matches: 0, allowCreate: false })).toBe('You have no other stores.')
	})

	it('reports a search without results, and the number of matches otherwise', () => {
		expect(pickerStatus({ total: 3, others: 2, matches: 0, allowCreate: true })).toBe('No store matches this search.')
		expect(pickerStatus({ total: 3, others: 2, matches: 1, allowCreate: true })).toBe('1 store')
		expect(pickerStatus({ total: 3, others: 2, matches: 2, allowCreate: true })).toBe('2 stores')
	})
})
