'use client'

import { useCallback, useMemo, useState } from 'react'

import type { TicketItem } from '@/types'

import { sumLineTotals } from '../helpers/group-ticket-items'

export interface TicketSelection {
	selectedIds: ReadonlySet<string>
	count: number
	total: number
	allSelected: boolean
	/** Some, but not all: the "select all" checkbox shows its dash. */
	partiallySelected: boolean
	isSelected: (id: string) => boolean
	toggle: (id: string) => void
	toggleAll: () => void
	clear: () => void
}

/** Which items of a receipt are ticked, shared by the list, the action bar and the compare view. */
export function useTicketSelection(items: TicketItem[]): TicketSelection {
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())

	const toggle = useCallback((id: string) => {
		setSelectedIds(prev => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
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
			toggleAll,
			clear,
		}
	}, [selectedIds, items, toggle, toggleAll, clear])
}
