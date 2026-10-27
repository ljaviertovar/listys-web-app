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
    expect(buildItemStoreSummary([], null, null)).toEqual({ usual_store: null, other_stores: [] })
    expect(formatAlsoAt([])).toBeNull()
  })

  it('returns only the usual store when no other store has stats', () => {
    const result = buildItemStoreSummary([stats[0]], stats[0].store, 'auto')
    expect(result).toEqual({
      usual_store: { id: 'store-1', name: 'No Frills', source: 'auto' },
      other_stores: [],
    })
  })

  it('excludes the usual store, sorts others by count and recency, and formats two plus the remainder', () => {
    const result = buildItemStoreSummary(stats, stats[0].store, 'manual')
    expect(result.usual_store).toEqual({ id: 'store-1', name: 'No Frills', source: 'manual' })
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

  it('hides unreadable store embeds for collaborators', () => {
    const result = buildItemStoreSummary([{ ...stats[0], store: null }], null, null)
    expect(result).toEqual({ usual_store: null, other_stores: [] })
  })
})
