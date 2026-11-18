import { PageContainer } from '@/components/app'
import { BaseListsPageHeader, BaseListsSkeleton } from '@/components/features/base-lists'

export default function ShoppingListsLoading() {
	return (
		<>
			<BaseListsPageHeader />
			<PageContainer>
				<BaseListsSkeleton />
			</PageContainer>
		</>
	)
}
