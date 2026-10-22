'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { ItemFormValues } from '@/components/features/list-items'
import { deleteShoppingSessionItem, toggleShoppingSessionItem, updateShoppingSessionItem } from '@/lib/api/endpoints'
import { broadcastListActivity } from '@/utils'
import type { ShoppingSessionItem } from '@/types'

export const SESSION_ITEM_TOGGLE_ERROR_COPY = {
	title: 'Could not update item',
	description: 'The item was returned to its previous state. Check your connection and try again.',
} as const

interface OptimisticToggleOptions {
	nextChecked: boolean
	setChecked: Dispatch<SetStateAction<boolean>>
	setToggling: Dispatch<SetStateAction<boolean>>
	update: () => Promise<{ error?: string | null }>
	onSuccess: () => void
	onError: (error: unknown) => void
}

/** Isolates the optimistic state transition so its rollback can be tested without a real session or endpoint. */
export async function runOptimisticSessionItemToggle({ nextChecked, setChecked, setToggling, update, onSuccess, onError }: OptimisticToggleOptions) {
	setChecked(nextChecked)
	setToggling(true)
	try {
		const { error } = await update()
		if (error) throw new Error(error)
		onSuccess()
	} catch (error) {
		setChecked(!nextChecked)
		onError(error)
	} finally {
		setToggling(false)
	}
}

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
		await runOptimisticSessionItemToggle({
			nextChecked: next,
			setChecked,
			setToggling,
			update: () => toggleShoppingSessionItem(item.id, next),
			onSuccess: refresh,
			onError: error => {
				console.error('Failed to toggle item:', error)
				toast.error(SESSION_ITEM_TOGGLE_ERROR_COPY.title, { description: SESSION_ITEM_TOGGLE_ERROR_COPY.description })
			},
		})
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
			console.error('Failed to update session item:', err)
			toast.error('Could not update item', { description: 'Check your connection and try again.' })
			throw err
		}
	}

	const remove = async () => {
		try {
			const { error } = await deleteShoppingSessionItem(item.id)
			if (error) throw new Error(error)
			toast.success('Item deleted')
			refresh()
			return true
		} catch (error) {
			console.error('Failed to delete session item:', error)
			toast.error('Could not delete item', { description: 'Check your connection and try again.' })
			return false
		}
	}

	return { checked, toggling, toggle, save, remove }
}
