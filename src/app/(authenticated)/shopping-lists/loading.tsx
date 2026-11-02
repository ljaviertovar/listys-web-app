import { PageContainer, PageHeader } from '@/components/app'
import { BaseListsSkeleton } from '@/components/features/base-lists'

export default function ShoppingListsLoading() {
	return (
		<>
			<PageHeader
				variant='screen'
				title='Lists'
				desc='All your lists in one place. Start with the things you always buy.'
			/>
			<PageContainer>
				<BaseListsSkeleton />
			</PageContainer>
		</>
	)
}
