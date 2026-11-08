import { describe, expect, it } from 'vitest'
import { describeLineResult } from '../helpers/describe-line-result'

const line = { id: 'line', name: 'Milk', price: 4 }
const item = { id: 'milk', name: 'Milk', checked: false }
const matched = { line, item, decision: { kind: 'match', itemId: 'milk' } as const }

describe('receipt line outcomes', () => {
	it('describes new and left-out lines', () => {
		expect(describeLineResult({ line, decision: { kind: 'add' } }).result).toBe('Adds as a new item')
		expect(describeLineResult({ line, decision: { kind: 'leave' } }).result).toBe('Left out by you')
	})
	it('explains quantity, remembered and user-linked outcomes', () => {
		expect(describeLineResult({ ...matched, quantityChange: { before: 2, after: 3 } }).result).toContain('usual quantity 2 → 3')
		expect(describeLineResult({ ...matched, origin: 'alias' })).toMatchObject({ tag: 'Remembered', result: 'Matches Milk · from an earlier receipt' })
		expect(describeLineResult({ ...matched, origin: 'user' })).toMatchObject({ tag: 'Linked by you', result: 'Matches Milk · remembered for next time' })
	})
	it('explains checking without a price and does not recheck an already checked item', () => {
		expect(describeLineResult({ ...matched, line: { ...line, price: null } })).toMatchObject({ tag: 'No price', result: 'Matches Milk · checked off without a price' })
		expect(describeLineResult({ ...matched, item: { ...item, checked: true } }).result).toBe('Matches Milk')
	})
	it('explains unreadable names and forbids changing them', () => {
		expect(describeLineResult({ line: { ...line, name: '' }, decision: { kind: 'leave' } })).toMatchObject({ tag: 'No name', canChange: false })
	})
})
