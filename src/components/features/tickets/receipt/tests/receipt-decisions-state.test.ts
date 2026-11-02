import { describe, expect, it } from 'vitest'

import type { LineDecision } from '../../add-to-list/helpers/merge-review'
import { createReceiptDecisionsState, decisionsForList, receiptDecisionsReducer } from '../helpers/receipt-decisions-state'

const link = (id: string): LineDecision => ({ kind: 'link', item: { id, name: id } })

describe('receipt decisions', () => {
	it('keeps what was decided for the list being compared', () => {
		const state = receiptDecisionsReducer(createReceiptDecisionsState(), { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: link('organic') })

		expect(decisionsForList(state, 'pantry').get('line-1')).toEqual(link('organic'))
	})

	it('stops applying decisions once another list is the target, and does not bring them back for it', () => {
		const state = receiptDecisionsReducer(createReceiptDecisionsState(), { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: { kind: 'new' } })

		expect(decisionsForList(state, 'office').size).toBe(0)
		expect(decisionsForList(state, null).size).toBe(0)
	})

	it('starts afresh when a decision is made against a different list', () => {
		const first = receiptDecisionsReducer(createReceiptDecisionsState(), { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: { kind: 'new' } })
		const second = receiptDecisionsReducer(first, { type: 'decide', baseListId: 'office', itemId: 'line-2', decision: { kind: 'new' } })

		expect([...decisionsForList(second, 'office').keys()]).toEqual(['line-2'])
		expect(decisionsForList(second, 'pantry').size).toBe(0)
	})

	it('restores the previous decision of a line, or none, which is what Undo does', () => {
		const decided = receiptDecisionsReducer(createReceiptDecisionsState(), { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: link('organic') })
		const changed = receiptDecisionsReducer(decided, { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: { kind: 'new' } })
		const undone = receiptDecisionsReducer(changed, { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: link('organic') })
		const cleared = receiptDecisionsReducer(undone, { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: null })

		expect(decisionsForList(changed, 'pantry').get('line-1')).toEqual({ kind: 'new' })
		expect(decisionsForList(undone, 'pantry').get('line-1')).toEqual(link('organic'))
		expect(decisionsForList(cleared, 'pantry').has('line-1')).toBe(false)
	})

	it('forgets everything on reset', () => {
		const decided = receiptDecisionsReducer(createReceiptDecisionsState(), { type: 'decide', baseListId: 'pantry', itemId: 'line-1', decision: { kind: 'new' } })

		expect(decisionsForList(receiptDecisionsReducer(decided, { type: 'reset' }), 'pantry').size).toBe(0)
	})
})
