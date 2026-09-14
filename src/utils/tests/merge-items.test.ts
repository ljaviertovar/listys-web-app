import { describe, it, expect } from 'vitest'
import { mergeItems, MergeableItem } from '../merge-items'

describe('mergeItems', () => {
  it('returns empty array when both inputs are empty', () => {
    expect(mergeItems([], [])).toEqual([])
  })

  it('returns base items unchanged when ticket items are empty', () => {
    const base: MergeableItem[] = [
      { name: 'Milk', quantity: 2, unit: 'L' },
      { name: 'Bread', quantity: 1, unit: 'unit' },
    ]
    const result = mergeItems(base, [])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ name: 'Milk', quantity: 2, unit: 'L' })
    expect(result[1]).toEqual({ name: 'Bread', quantity: 1, unit: 'unit' })
  })

  it('returns all ticket items when base items are empty', () => {
    const tickets: MergeableItem[] = [
      { name: 'Eggs', quantity: 12, unit: 'unit' },
    ]
    const result = mergeItems([], tickets)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ name: 'Eggs', quantity: 12, unit: 'unit' })
  })

  it('merges items case-insensitively by name', () => {
    const base: MergeableItem[] = [{ name: 'Milk', quantity: 1, unit: 'L' }]
    const tickets: MergeableItem[] = [{ name: 'milk', quantity: 2, unit: 'L' }]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(3)
  })

  it('merges items with whitespace trimming', () => {
    const base: MergeableItem[] = [{ name: 'Milk', quantity: 1, unit: 'L' }]
    const tickets: MergeableItem[] = [{ name: '  Milk  ', quantity: 2, unit: 'L' }]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(3)
  })

  it('accumulates quantities when names match', () => {
    const base: MergeableItem[] = [{ name: 'Apple', quantity: 3, unit: 'kg' }]
    const tickets: MergeableItem[] = [{ name: 'apple', quantity: 2, unit: 'kg' }]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(5)
  })

  it('handles null/undefined quantity as 0', () => {
    const base: MergeableItem[] = [{ name: 'Salt', quantity: null as any, unit: 'kg' }]
    const tickets: MergeableItem[] = [{ name: 'salt', quantity: undefined as any, unit: 'kg' }]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(0)
  })

  it('adds non-matching ticket items as new entries', () => {
    const base: MergeableItem[] = [{ name: 'Milk', quantity: 1, unit: 'L' }]
    const tickets: MergeableItem[] = [{ name: 'Butter', quantity: 1, unit: 'unit' }]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(2)
    expect(result.map(i => i.name)).toEqual(['Milk', 'Butter'])
  })

  it('preserves order: base items first, then new ticket items', () => {
    const base: MergeableItem[] = [
      { name: 'A', quantity: 1, unit: 'u' },
      { name: 'B', quantity: 1, unit: 'u' },
    ]
    const tickets: MergeableItem[] = [
      { name: 'C', quantity: 1, unit: 'u' },
      { name: 'a', quantity: 1, unit: 'u' }, // merges with A
    ]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(3)
    expect(result.map(i => i.name)).toEqual(['A', 'B', 'C'])
    expect(result[0].quantity).toBe(2) // A: 1 + 1
  })

  it('handles duplicate names in ticket items (quantities accumulate)', () => {
    const base: MergeableItem[] = [{ name: 'Juice', quantity: 1, unit: 'L' }]
    const tickets: MergeableItem[] = [
      { name: 'Juice', quantity: 2, unit: 'bottle' },
      { name: 'juice', quantity: 3, unit: 'pack' },
    ]
    const result = mergeItems(base, tickets)
    expect(result).toHaveLength(1)
    // 1 (base) + 2 (first ticket) + 3 (second ticket) = 6
    expect(result[0].quantity).toBe(6)
  })
})
