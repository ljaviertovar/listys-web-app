import { Delete02Icon, Edit02Icon, Share08Icon } from '@hugeicons/core-free-icons'

import type { RowMenuAction } from '@/components/commons'

export function getListCardMenuActions({
	hasActiveTrip,
	onEdit,
	onShare,
	onDelete,
}: {
	hasActiveTrip: boolean
	onEdit: () => void
	onShare: () => void
	onDelete: () => void
}): RowMenuAction[] {
	return [
		{ label: 'Edit List', icon: Edit02Icon, onSelect: onEdit },
		{ label: 'Share', icon: Share08Icon, onSelect: onShare },
		...(!hasActiveTrip ? [{ label: 'Delete List', icon: Delete02Icon, onSelect: onDelete, tone: 'danger' as const, separatorBefore: true }] : []),
	]
}
