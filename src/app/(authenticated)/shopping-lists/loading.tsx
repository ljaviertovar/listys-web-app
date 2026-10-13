import { PageContainer, PageHeader } from '@/components/app'
import { GroupsSkeleton } from '@/components/features/shopping-lists'

export default function GroupsLoading() {
	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Shopping List Groups'
				desc='Organize your shopping lists into groups or stores. Eg: Groceries, Electronics, Walmart, etc.'
			/>
			<PageContainer>
				<GroupsSkeleton />
			</PageContainer>
		</>
	)
}
