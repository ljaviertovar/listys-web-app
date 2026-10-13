import { FolderSearchIcon } from '@hugeicons/core-free-icons'

import { EmptyStateCard, EntityCardSkeleton, ListToolbar } from '@/components/commons'
import { Skeleton } from '@/components/ui/skeleton'

import { CreateGroupDialog } from './create-group-dialog'
import { GroupCard } from './group-card'

type GroupCardGroup = Parameters<typeof GroupCard>[0]['group']

interface GroupsListProps {
	groups: GroupCardGroup[]
}

/** The groups screen: the count with "New Group" and a grid of cards, or the first-use card with its own button. */
export function GroupsList({ groups }: GroupsListProps) {
	if (groups.length === 0) {
		return (
			<EmptyStateCard
				icon={FolderSearchIcon}
				title='No groups yet'
				description='Create one group for each store you shop at, like Walmart or Costco, and keep its lists together.'
				testId='groups-empty-state'
			>
				<CreateGroupDialog className='h-12 px-6 text-[15px]' />
			</EmptyStateCard>
		)
	}

	return (
		<>
			<ListToolbar
				count={groups.length}
				unit={{ one: 'group', many: 'groups' }}
				testId='groups-toolbar'
			>
				<CreateGroupDialog />
			</ListToolbar>
			<div
				data-testid='groups-grid'
				className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'
			>
				{groups.map(group => (
					<GroupCard
						key={group.id}
						group={group}
					/>
				))}
			</div>
		</>
	)
}

/** What the groups screen shows while its data loads: the toolbar and three card shapes. */
export function GroupsSkeleton() {
	return (
		<div
			data-testid='groups-skeleton'
			className='flex flex-col gap-4'
		>
			<div className='flex min-h-11 items-center justify-between'>
				<Skeleton className='h-3.5 w-16 rounded-md' />
				<Skeleton className='h-11 w-32 rounded-[12px]' />
			</div>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{[0, 1, 2].map(index => (
					<EntityCardSkeleton
						key={index}
						testId={`group-card-skeleton-${index}`}
					/>
				))}
			</div>
		</div>
	)
}
