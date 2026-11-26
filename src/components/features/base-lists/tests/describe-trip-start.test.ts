import { describe, expect, it } from 'vitest'

import type { BaseListItemWithStoreSummary } from '@/types'

import { describeTripStart } from '../helpers/describe-trip-start'

const NO_FRILLS = { id: 'no-frills', name: 'No Frills' }
const COSTCO = { id: 'costco', name: 'Costco' }
const FRESHCO = { id: 'freshco', name: 'FreshCo' }

function item(name: string, store: typeof NO_FRILLS | null, checked = false, alsoAt: Array<typeof NO_FRILLS> = []) {
	return {
		id: name,
		name,
		needed_at: checked ? '2026-11-26T10:00:00.000Z' : null,
		usual_store: store ? { ...store, source: 'auto' } : null,
		other_stores: alsoAt.map(other => ({ ...other, purchase_count: 1 })),
	} as unknown as BaseListItemWithStoreSummary
}

const describeStart = (items: BaseListItemWithStoreSummary[], store: typeof NO_FRILLS | null = null) =>
	describeTripStart({ items, listName: 'Pantry', store })

const names = (items: BaseListItemWithStoreSummary[]) => items.map(entry => entry.name)
const sentence = ({ notice }: ReturnType<typeof describeStart>) => `${notice.lead}${notice.strong}${notice.rest}`

describe('describeTripStart', () => {
	const unchecked = [item('Eggs', NO_FRILLS), item('Rice', COSTCO), item('Foil', null)]

	it('takes the whole list and says so when nothing is checked', () => {
		const trip = describeStart(unchecked)

		expect(trip.onlyChecked).toBe(false)
		expect(names(trip.estimateItems)).toEqual(['Eggs', 'Rice', 'Foil'])
		expect(sentence(trip)).toBe('This trip starts with all 3 items in “Pantry”.')
		expect(trip.buttonLabel).toBe('Start Shopping')
	})

	it('takes only the checked items', () => {
		const trip = describeStart([item('Eggs', NO_FRILLS, true), item('Rice', COSTCO, true), item('Foil', null)])

		expect(trip.onlyChecked).toBe(true)
		expect(names(trip.estimateItems)).toEqual(['Eggs', 'Rice'])
		expect(trip.summary).toBe('2 of 3 items checked')
		expect(sentence(trip)).toBe('This trip starts with the 2 items you checked. The other 1 stays on the list.')
		expect(trip.buttonLabel).toBe('Start Shopping · 2 Items')
	})

	it('takes only the checked items of the chosen store and names what stays checked', () => {
		const trip = describeStart(
			[item('Eggs', NO_FRILLS, true), item('Milk', COSTCO, true, [NO_FRILLS]), item('Rice', COSTCO, true), item('Foil', null)],
			NO_FRILLS,
		)

		expect(trip.onlyChecked).toBe(true)
		expect(names(trip.estimateItems)).toEqual(['Eggs', 'Milk'])
		expect(trip.scopeDetail).toBe('2 of your 3 checked items')
		expect(sentence(trip)).toBe('This trip starts with 2 items. Rice stays checked for another trip.')
		expect(trip.buttonLabel).toBe('Start Shopping at No Frills')
	})

	it('takes the whole list for a store with nothing checked anywhere, store items first', () => {
		const trip = describeStart(unchecked, NO_FRILLS)

		expect(trip.onlyChecked).toBe(false)
		expect(names(trip.estimateItems)).toEqual(['Eggs'])
		expect(trip.notice.tone).toBe('info')
		expect(sentence(trip)).toBe('This trip starts with all 3 items. The 1 from No Frills comes first. The other 2 are folded below.')
	})

	it('takes the whole list and warns when the checks are all from other stores', () => {
		const trip = describeStart([item('Eggs', NO_FRILLS, true), item('Kale', FRESHCO), item('Foil', null)], FRESHCO)

		expect(trip.onlyChecked).toBe(false)
		expect(trip.notice).toMatchObject({ tone: 'warning', title: 'Nothing checked at FreshCo' })
		expect(sentence(trip)).toBe('This trip starts with all 3 items, FreshCo’s 1 first. Your 1 checked item stays checked until you buy it.')
	})
})
