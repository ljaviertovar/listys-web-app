import { describe, expect, it } from 'vitest'

import type { TicketSessionMatch } from '@/lib/api/endpoints'
import { getAvailableChoices, resolveDecision, toRequestParts } from '../helpers/line-decision'

const line = { id: 'line', name: 'Milk' }
const match = (kind: 'name' | 'alias' | 'none'): TicketSessionMatch => ({
	ticket_item_id: line.id, match: kind,
	shopping_session_item: kind === 'none' ? null : { id: 'milk', name: 'Milk', checked: false },
})

describe('receipt line decisions', () => {
	it('adds an unmatched line and matches a remembered line by default', () => {
		expect(resolveDecision(line, match('none'))).toEqual({ kind: 'add' })
		expect(resolveDecision(line, match('alias'))).toEqual({ kind: 'match', itemId: 'milk' })
	})
	it('unlinks a matched line when left out, and sends only changed links', () => {
		expect(toRequestParts(line, { kind: 'leave' }, match('alias'))).toEqual({ link: { ticket_item_id: 'line', shopping_session_item_id: null } })
		expect(toRequestParts(line, { kind: 'match', itemId: 'milk' }, match('alias'))).toEqual({})
		expect(toRequestParts(line, { kind: 'match', itemId: 'bread' }, match('alias'))).toEqual({ link: { ticket_item_id: 'line', shopping_session_item_id: 'bread' } })
	})
	it('restricts an exact name match to its own item and cannot add it again', () => {
		const choices = getAvailableChoices(line, match('name'))
		expect(choices.find(choice => choice.kind === 'match')?.itemIds).toEqual(['milk'])
		expect(choices.find(choice => choice.kind === 'add')?.disabled).toBe(true)
	})
	it('fixes an unreadable line as left out, regardless of an override, and excludes it from the request', () => {
		const unreadable = { id: 'line', name: ' ? ' }
		expect(resolveDecision(unreadable, match('name'), new Map([['line', { kind: 'add' }]]))).toEqual({ kind: 'leave' })
		expect(toRequestParts(unreadable, { kind: 'match', itemId: 'milk' }, match('name'))).toEqual({})
	})
})
