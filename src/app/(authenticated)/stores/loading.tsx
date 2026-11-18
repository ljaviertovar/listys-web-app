import { PageContainer } from '@/components/app'
import { StoresPageHeader, StoresSkeleton } from '@/components/features/stores'

export default function StoresLoading() {
	return (
		<>
			<StoresPageHeader />
			<PageContainer>
				<StoresSkeleton />
			</PageContainer>
		</>
	)
}
