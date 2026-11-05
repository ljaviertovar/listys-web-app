import { describe, expect, it } from 'vitest'
import { buildItemStoreSummary, formatAlsoAt } from '../items/helpers/item-store-summary'

const stats = [
  { store_id: 'store-1', store: { id: 'store-1', name: 'No Frills' }, purchase_count: 8, last_purchased_at: '2026-10-01T00:00:00Z' },
  { store_id: 'store-2', store: { id: 'store-2', name: 'Metro' }, purchase_count: 6, last_purchased_at: '2026-09-01T00:00:00Z' },
  { store_id: 'store-3', store: { id: 'store-3', name: 'Costco' }, purchase_count: 6, last_purchased_at: '2026-10-02T00:00:00Z' },
  { store_id: 'store-4', store: { id: 'store-4', name: 'Walmart' }, purchase_count: 2, last_purchased_at: '2026-10-03T00:00:00Z' },
]

describe('item store summary', () => {
  it('returns an empty summary when there is no data', () => {
    expect(buildItemStoreSummary([], null, null)).toMatchObject({ usual_store: null, purchase_total: 0, other_stores: [], store_prices: [] })
    expect(formatAlsoAt([])).toBeNull()
  })

  it('returns only the usual store when no other store has stats', () => {
    const result = buildItemStoreSummary([stats[0]], stats[0].store, 'auto')
    expect(result).toMatchObject({
      usual_store: { id: 'store-1', name: 'No Frills', source: 'auto', purchase_count: 8 },
      purchase_total: 8,
      other_stores: [],
      store_prices: [],
    })
  })

  it('excludes the usual store, sorts others by count and recency, and formats two plus the remainder', () => {
    const result = buildItemStoreSummary(stats, stats[0].store, 'manual')
    expect(result.usual_store).toEqual({ id: 'store-1', name: 'No Frills', source: 'manual', purchase_count: 8 })
    expect(result.other_stores).toEqual([
      { id: 'store-3', name: 'Costco', purchase_count: 6 },
      { id: 'store-2', name: 'Metro', purchase_count: 6 },
      { id: 'store-4', name: 'Walmart', purchase_count: 2 },
    ])
    expect(formatAlsoAt(result.other_stores)).toBe('Also at Costco, Metro +1')
  })

  it('returns store stats when there is no usual store', () => {
    const result = buildItemStoreSummary(stats, null, null)
    expect(result.usual_store).toBeNull()
    expect(result.other_stores).toHaveLength(4)
  })

	it('keeps numeric price rows for compatibility and adds unpriced stores to history', () => {
		const result = buildItemStoreSummary([
			{ ...stats[0], last_price: 5.49, last_quantity: 2, last_unit: 'each', last_price_at: '2026-10-01T00:00:00Z' },
			stats[1],
		], null, null)
		expect(result.store_history).toHaveLength(2)
		expect(result.store_history.find(row => row.store.id === 'store-2')).toMatchObject({ last_price: null, purchase_count: 6 })
		expect(result.store_prices).toEqual([{
			store: { id: 'store-1', name: 'No Frills' },
			last_price: 5.49,
			last_quantity: 2,
			last_unit: 'each',
			last_price_at: '2026-10-01T00:00:00Z',
			purchase_count: 8,
		}])
	})

  it('hides unreadable store embeds for collaborators', () => {
    const result = buildItemStoreSummary([{ ...stats[0], store: null }], null, null)
    expect(result).toMatchObject({ usual_store: null, purchase_total: 0, other_stores: [], store_prices: [] })
  })
})
