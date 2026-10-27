'use client'

import { useEffect, useState } from 'react'

import { getStores } from '@/lib/api/endpoints'
import type { Store } from '@/types'

type StoresState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; stores: Store[] }

/** The user's stores for a picker, read when the picker mounts, with a retry after a failed read. */
export function useStores() {
	const [state, setState] = useState<StoresState>({ status: 'loading' })
	// Bumped by retry so the effect reads the stores once more.
	const [attempt, setAttempt] = useState(0)

	useEffect(() => {
		let cancelled = false

		getStores()
			.then(result => {
				if (cancelled) return
				setState(result.error ? { status: 'error' } : { status: 'ready', stores: result.data ?? [] })
			})
			.catch(() => {
				if (!cancelled) setState({ status: 'error' })
			})

		return () => {
			cancelled = true
		}
	}, [attempt])

	const retry = () => {
		setState({ status: 'loading' })
		setAttempt(current => current + 1)
	}

	return { ...state, retry }
}
