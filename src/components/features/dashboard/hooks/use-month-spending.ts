'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getSpending, type SpendingSummary } from '@/lib/api/endpoints'
import { currentMonthRange } from '../helpers/build-dashboard-model'

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; summary: SpendingSummary }

export function useMonthSpending() {
	const [attempt, setAttempt] = useState(0)
	const [state, setState] = useState<State>({ status: 'loading' })
	const range = useMemo(() => currentMonthRange(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone), [])

	useEffect(() => {
		let active = true
		getSpending(range.from, range.to).then(result => {
			if (!active) return
			if (result.error || !result.data) setState({ status: 'error' })
			else setState({ status: 'ready', summary: result.data })
		})
		return () => { active = false }
	}, [attempt, range.from, range.to])

	const retry = useCallback(() => {
		setState({ status: 'loading' })
		setAttempt(value => value + 1)
	}, [])
	return { ...state, retry }
}
