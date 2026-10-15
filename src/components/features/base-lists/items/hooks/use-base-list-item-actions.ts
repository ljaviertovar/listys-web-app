'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { ItemFormValues } from '@/components/features/list-items'
import { createBaseListItem, deleteBaseListItem, updateBaseListItem } from '@/lib/api/endpoints'
import { broadcastListActivity } from '@/utils'
import type { BaseListItem } from '@/types'

import { toRestorePayload } from '../helpers/restore-item'

/** Saving and deleting one item of a base list. A delete offers "Undo", which adds the item back. */
export function useBaseListItemActions(item: BaseListItem) {
	const router = useRouter()

	const refresh = () => {
		router.refresh()
		broadcastListActivity(`list_activity_${item.base_list_id}`)
	}

	const save = async (values: ItemFormValues) => {
		try {
			const { error } = await updateBaseListItem(item.id, {
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

	const restore = async () => {
		const { error } = await createBaseListItem(toRestorePayload(item) as { base_list_id: string } & Record<string, unknown>)
		if (error) {
			toast.error('Could not undo', { description: error })
			return
		}
		refresh()
	}

	const remove = async () => {
		const { error } = await deleteBaseListItem(item.id)
		if (error) {
			toast.error('Failed to delete item', { description: error })
			return
		}
		refresh()
		toast('Item deleted', { duration: 6000, action: { label: 'Undo', onClick: restore } })
	}

	return { save, remove }
}
