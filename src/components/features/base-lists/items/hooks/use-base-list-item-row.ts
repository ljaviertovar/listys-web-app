'use client'

import { useRef, useState } from 'react'
import type { BaseListItemWithStoreSummary } from '@/types'
import { useBaseListItemActions } from './use-base-list-item-actions'

/** Coordinates the row's editor, price sheet and store picker while keeping mutations behind explicit confirmation. */
export function useBaseListItemRow(item: BaseListItemWithStoreSummary) {
	const [editing, setEditing] = useState(false)
	const [storePickerOpen, setStorePickerOpen] = useState(false)
	const [pricesOpen, setPricesOpen] = useState(false)
	const [usualStorePending, setUsualStorePending] = useState(false)
	const pending = useRef(false)
	const actions = useBaseListItemActions(item)
	const handleStorePick = async (pick: Parameters<typeof actions.setUsualStore>[0]) => {
		if (pending.current) return
		pending.current = true
		setUsualStorePending(true)
		try {
			if (await actions.setUsualStore(pick)) setStorePickerOpen(false)
		} finally {
			pending.current = false
			setUsualStorePending(false)
		}
	}
	return { ...actions, editing, setEditing, storePickerOpen, setStorePickerOpen, pricesOpen, setPricesOpen, usualStorePending, handleStorePick,
		changeUsualStore: () => { setPricesOpen(false); setStorePickerOpen(true) } }
}
