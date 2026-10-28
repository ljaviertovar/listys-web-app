'use client'

import { useCallback, useMemo, useState } from 'react'

import type { TicketItem } from '@/types'

import { sumLineTotals } from '../helpers/group-ticket-items'
import { mergeTicketSelection } from '../helpers/ticket-selection-state'

export interface TicketSelection {
	selectedIds: ReadonlySet<string>
	count: number
	total: number
	allSelected: boolean
	/** Some, but not all: the "select all" checkbox shows its dash. */
	partiallySelected: boolean
	isSelected: (id: string) => boolean
	toggle: (id: string) => void
	selectMany: (ids: readonly string[]) => void
	toggleAll: () => void
	clear: () => void
}

export function createEmptyTicketSelection(): ReadonlySet<string> {
	return new Set()
}

/** Which items of a receipt are ticked, shared by the list, the action bar and the compare view. */
export function useTicketSelection(items: TicketItem[]): TicketSelection {
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(createEmptyTicketSelection)

	const toggle = useCallback((id: string) => {
		setSelectedIds(prev => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}, [])

	const selectMany = useCallback((ids: readonly string[]) => {
		setSelectedIds(prev => mergeTicketSelection(prev, ids))
	}, [])

	const toggleAll = useCallback(() => {
		setSelectedIds(prev => (prev.size === items.length ? new Set() : new Set(items.map(item => item.id))))
	}, [items])

	const clear = useCallback(() => setSelectedIds(new Set()), [])

	return useMemo(() => {
		const count = selectedIds.size
		return {
			selectedIds,
			count,
			total: sumLineTotals(items.filter(item => selectedIds.has(item.id))),
			allSelected: items.length > 0 && count === items.length,
			partiallySelected: count > 0 && count < items.length,
			isSelected: (id: string) => selectedIds.has(id),
			toggle,
			selectMany,
			toggleAll,
			clear,
		}
	}, [selectedIds, items, toggle, selectMany, toggleAll, clear])
}
