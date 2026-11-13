'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getSpending, type SpendingSummary } from '@/lib/api/endpoints'
import { currentMonthRange, previousMonthRange } from '../helpers/build-dashboard-model'

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; summary: SpendingSummary }

export function useMonthSpending() {
	const [attempt, setAttempt] = useState(0)
	const [state, setState] = useState<State>({ status: 'loading' })
	const { range, previousRange } = useMemo(() => {
		const now = new Date()
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
		return { range: currentMonthRange(now, timeZone), previousRange: previousMonthRange(now, timeZone) }
	}, [])

	useEffect(() => {
		let active = true
		getSpending(range.from, range.to, previousRange.from, previousRange.to).then(result => {
			if (!active) return
			if (result.error || !result.data) setState({ status: 'error' })
			else setState({ status: 'ready', summary: result.data })
		})
		return () => { active = false }
	}, [attempt, range.from, range.to, previousRange.from, previousRange.to])

	const retry = useCallback(() => {
		setState({ status: 'loading' })
		setAttempt(value => value + 1)
	}, [])
	return { ...state, retry }
}
