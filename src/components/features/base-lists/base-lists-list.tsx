import { ListViewIcon } from '@hugeicons/core-free-icons'

import { EmptyStateCard, ListToolbar } from '@/components/commons'

import type { BaseListWithCount } from '@/types'

import { BaseListCard } from './base-list-card'
import { CreateBaseListDialog } from './create-base-list-dialog'

interface BaseListsListProps {
	groupId: string
	groupName: string
	baseLists: BaseListWithCount[]
	/** The list being shopped right now is left out: it is locked until the session ends. */
	activeBaseListId?: string | null
}

/** The lists of one group: the count with "New Base List" and a grid of cards, or the first-use card with its own button. */
export function BaseListsList({ groupId, groupName, baseLists, activeBaseListId }: BaseListsListProps) {
	const visible = baseLists.filter(list => list.id !== activeBaseListId)

	if (visible.length === 0) {
		return (
			<EmptyStateCard
				icon={ListViewIcon}
				title={`No lists in ${groupName} yet`}
				description='A base list is a template you reuse every time you shop here. Start with the things you always buy.'
				testId='base-lists-empty-state'
			>
				<CreateBaseListDialog
					groupId={groupId}
					className='h-12 px-6 text-[15px]'
				/>
			</EmptyStateCard>
		)
	}

	return (
		<>
			<ListToolbar
				count={visible.length}
				unit={{ one: 'list', many: 'lists' }}
				testId='base-lists-toolbar'
			>
				<CreateBaseListDialog groupId={groupId} />
			</ListToolbar>
			<div
				data-testid='base-lists-grid'
				className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
			>
				{visible.map(baseList => (
					<BaseListCard
						key={baseList.id}
						baseList={baseList}
					/>
				))}
			</div>
		</>
	)
}
