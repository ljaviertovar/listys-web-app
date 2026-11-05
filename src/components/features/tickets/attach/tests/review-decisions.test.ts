import { describe, expect, it } from 'vitest'
import { changeReviewDecision, createReviewDecisions } from '../helpers/review-decisions'
import { describeAttachSuccess } from '../helpers/describe-attach-success'

describe('review decision lifecycle', () => {
	it('keeps overrides only while different from the default and starts fresh when reopened', () => {
		const line = { id: 'line', name: 'Batteries' }
		const changed = changeReviewDecision(createReviewDecisions(), line, undefined, { kind: 'leave' })
		expect(changed.get('line')).toEqual({ kind: 'leave' })
		expect(changeReviewDecision(changed, line, undefined, { kind: 'add' }).size).toBe(0)
		expect(createReviewDecisions().size).toBe(0)
		expect(changed.size).toBe(1)
	})
})

describe('attach success notice', () => {
	it('adds a capacity notice only when new items could not fit in the list', () => {
		const summary = { completed_now: false, matched_count: 1, checked_now_count: 0, added_count: 2, priced_count: 1, over_limit_count: 0, replayed: false }
		expect(describeAttachSuccess(summary).description).toBeUndefined()
		expect(describeAttachSuccess({ ...summary, over_limit_count: 2 }).description).toContain('2 new items')
	})
})
