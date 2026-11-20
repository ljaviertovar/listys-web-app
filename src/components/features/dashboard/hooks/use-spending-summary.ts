'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getAllTimeSpending, getSpending, type SpendingSummary } from '@/lib/api/endpoints'
import { currentMonthRange, previousMonthRange } from '../helpers/build-dashboard-model'

export type SpendingScope = 'month' | 'all'

type Outcome = { status: 'error' } | { status: 'ready'; summary: SpendingSummary }
/** The answer for one scope and one attempt: when either changes the old answer no longer fits, so the card is loading again. */
type Answer = { scope: SpendingScope; attempt: number; outcome: Outcome }

export function useSpendingSummary(scope: SpendingScope) {
	const [attempt, setAttempt] = useState(0)
	const [answer, setAnswer] = useState<Answer | null>(null)
	const { range, previousRange, timeZone } = useMemo(() => {
		const now = new Date()
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
		return { range: currentMonthRange(now, timeZone), previousRange: previousMonthRange(now, timeZone), timeZone }
	}, [])

	useEffect(() => {
		let active = true
		const request = scope === 'all' ? getAllTimeSpending(timeZone) : getSpending(range.from, range.to, previousRange.from, previousRange.to, timeZone)
		request.then(result => {
			if (!active) return
			const outcome: Outcome = result.error || !result.data ? { status: 'error' } : { status: 'ready', summary: result.data }
			setAnswer({ scope, attempt, outcome })
		})
		return () => { active = false }
	}, [scope, attempt, range.from, range.to, previousRange.from, previousRange.to, timeZone])

	const retry = useCallback(() => setAttempt(value => value + 1), [])
	const current = answer && answer.scope === scope && answer.attempt === attempt ? answer.outcome : null
	return { ...(current ?? { status: 'loading' as const }), retry }
}
