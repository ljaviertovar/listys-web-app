'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { ItemFormValues } from '@/components/features/list-items'
import { deleteShoppingSessionItem, toggleShoppingSessionItem, updateShoppingSessionItem } from '@/lib/api/endpoints'
import { broadcastListActivity } from '@/utils'
import type { ShoppingSessionItem } from '@/types'

/** What one item of a running session can do: be ticked, be edited, be deleted. A tick shows at once and is undone if it fails. */
export function useSessionItemActions(item: ShoppingSessionItem) {
	const router = useRouter()
	const [checked, setChecked] = useState(item.checked ?? false)
	const [toggling, setToggling] = useState(false)

	const refresh = () => {
		router.refresh()
		broadcastListActivity(`session_activity_${item.shopping_session_id}`)
	}

	const toggle = async () => {
		const next = !checked
		setChecked(next) // Optimistic update
		setToggling(true)
		try {
			const { error } = await toggleShoppingSessionItem(item.id, next)
			if (error) throw new Error(error)
			refresh()
		} catch (err) {
			setChecked(!next) // Revert on error
			console.error('Failed to toggle item:', err)
		} finally {
			setToggling(false)
		}
	}

	const save = async (values: ItemFormValues) => {
		try {
			const { error } = await updateShoppingSessionItem(item.id, {
				name: values.name.trim(),
				quantity: values.quantity,
				unit: values.unit,
				notes: values.notes?.trim() ?? '',
			})
			if (error) throw new Error(error)
			toast.success('Item updated')
			refresh()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to update item')
			throw err
		}
	}

	const remove = async () => {
		const { error } = await deleteShoppingSessionItem(item.id)
		if (error) {
			toast.error('Failed to delete item', { description: error })
			return
		}
		toast.success('Item deleted')
		refresh()
	}

	return { checked, toggling, toggle, save, remove }
}
