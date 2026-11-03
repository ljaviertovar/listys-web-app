'use client'

import { useCallback, useEffect, useState } from 'react'

import { getAvailableReceipts, type AvailableReceipt } from '@/lib/api/endpoints'

type State =
	| { status: 'loading' }
	| { status: 'error'; message: string }
	| { status: 'ready'; receipts: AvailableReceipt[] }

/** The uploaded receipts that can still be attached to a trip, read each time the chooser opens so it never shows a stale list. */
export function useAvailableReceipts(sessionId: string, enabled: boolean) {
	const [state, setState] = useState<State>({ status: 'loading' })

	const load = useCallback(async () => {
		setState({ status: 'loading' })
		const result = await getAvailableReceipts(sessionId)
		if (result.error) setState({ status: 'error', message: result.error })
		else setState({ status: 'ready', receipts: result.data ?? [] })
	}, [sessionId])

	useEffect(() => {
		if (!enabled) return
		let active = true
		getAvailableReceipts(sessionId).then(result => {
			if (!active) return
			if (result.error) setState({ status: 'error', message: result.error })
			else setState({ status: 'ready', receipts: result.data ?? [] })
		})
		return () => {
			active = false
			// Reopening starts from loading, not from the list the previous visit saw.
			setState({ status: 'loading' })
		}
	}, [sessionId, enabled])

	return { state, reload: load }
}
