'use client'

import { useRef, useState } from 'react'

import { getBaseList } from '@/lib/api/endpoints'
import type { BaseListItemWithStoreSummary } from '@/types'

type DialogItems = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: BaseListItemWithStoreSummary[] }

/**
 * The items the start sheet decides over. A screen that has them passes them in; the dashboard only knows how many
 * there are, so the sheet reads them each time it opens. Without them it could not respect what is checked.
 */
export function useDialogItems(baseListId: string, provided: BaseListItemWithStoreSummary[] | undefined) {
	const [fetched, setFetched] = useState<DialogItems>({ status: 'loading' })
	// A slow earlier read must not replace the answer of a later one.
	const latestRequest = useRef(0)

	const load = async () => {
		if (provided) return
		const request = ++latestRequest.current
		setFetched({ status: 'loading' })
		const { data, error } = await getBaseList(baseListId)
		if (request !== latestRequest.current) return
		setFetched(error || !data ? { status: 'error' } : { status: 'ready', items: data.items ?? [] })
	}

	const state: DialogItems = provided ? { status: 'ready', items: provided } : fetched

	return { state, load }
}
