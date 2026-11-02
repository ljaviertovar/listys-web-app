'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getBaseList } from '@/lib/api/endpoints'
import { formatItemName } from '@/utils'
import type { TicketItem } from '@/types'

import type { LineDecision, MatchedItem } from '../../add-to-list/helpers/merge-review'

const UNDO_WINDOW_MS = 6000

interface UseReceiptMatchActionsInput {
	items: TicketItem[]
	/** The list being compared: the items a line can be matched to are this list's. */
	baseListId: string | null
	decisions: ReadonlyMap<string, LineDecision>
	decide: (itemId: string, decision: LineDecision | null) => LineDecision | null
}

/**
 * What a user can do with a line's proposed match on the receipt screen: confirm it, choose another item of the list, or add the
 * line as a new item. Each choice is announced with an Undo that puts the line back as it was. The list's items are only
 * fetched, once per list, when the user first asks to choose another item.
 */
export function useReceiptMatchActions({ items, baseListId, decisions, decide }: UseReceiptMatchActionsInput) {
	const [linkingId, setLinkingId] = useState<string | null>(null)
	const [loadedItems, setLoadedItems] = useState<{ baseListId: string; items: MatchedItem[] } | null>(null)
	const itemsById = useMemo(() => new Map(items.map(item => [item.id, item])), [items])

	useEffect(() => {
		if (!linkingId || !baseListId || loadedItems?.baseListId === baseListId) return
		let cancelled = false

		const fail = () => {
			if (cancelled) return
			toast.error('We couldn’t load the items of this list. Try again.')
			setLinkingId(null)
		}

		getBaseList(baseListId).then(result => {
			if (cancelled) return
			if (result.error) return fail()
			const listItems = ((result.data?.items ?? []) as Array<{ id: string; name: string }>)
				.map(entry => ({ id: entry.id, name: entry.name }))
				.sort((a, b) => a.name.localeCompare(b.name))
			setLoadedItems({ baseListId, items: listItems })
		}).catch(fail)

		return () => {
			cancelled = true
		}
	}, [linkingId, baseListId, loadedItems?.baseListId])

	const resolve = useCallback((itemId: string, decision: LineDecision, message: string) => {
		const previous = decide(itemId, decision)
		toast(message, {
			duration: UNDO_WINDOW_MS,
			action: { label: 'Undo', onClick: () => { decide(itemId, previous) } },
		})
	}, [decide])

	const lineName = useCallback((itemId: string) => formatItemName(itemsById.get(itemId)?.name ?? ''), [itemsById])

	const confirm = useCallback((itemId: string, target: MatchedItem) => {
		resolve(itemId, { kind: 'link', item: target }, `“${lineName(itemId)}” will update “${formatItemName(target.name)}”`)
	}, [resolve, lineName])

	const addAsNew = useCallback((itemId: string) => {
		resolve(itemId, { kind: 'new' }, `“${lineName(itemId)}” will be added as a new item`)
	}, [resolve, lineName])

	const chooseAnother = useCallback((itemId: string) => setLinkingId(itemId), [])

	const linkingDecision = linkingId ? decisions.get(linkingId) : undefined

	/** Props of the `LinkItemDialog` that picks another item; the screen renders it once, outside the rows. */
	const linkDialog = {
		lineName: linkingId ? itemsById.get(linkingId)?.name ?? null : null,
		currentItemId: linkingDecision?.kind === 'link' ? linkingDecision.item.id : null,
		items: loadedItems?.baseListId === baseListId ? loadedItems.items : [],
		onClose: () => setLinkingId(null),
		onLink: (target: MatchedItem) => {
			if (linkingId) confirm(linkingId, target)
			setLinkingId(null)
		},
	}

	return { confirm, addAsNew, chooseAnother, linkDialog }
}

export type ReceiptMatchActions = ReturnType<typeof useReceiptMatchActions>
