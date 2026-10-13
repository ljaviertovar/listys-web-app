import { PageContainer, PageHeader } from '@/components/app'
import { GroupsSkeleton } from '@/components/features/shopping-lists'

export default function BaseListsLoading() {
	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/shopping-lists', label: 'Back to Shopping Lists' }}
				title='Base Lists'
				desc='Manage your base shopping lists'
			/>
			<PageContainer>
				<GroupsSkeleton />
			</PageContainer>
		</>
	)
}
