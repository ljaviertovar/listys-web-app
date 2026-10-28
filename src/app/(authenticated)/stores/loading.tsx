import { PageContainer, PageHeader } from '@/components/app'
import { StoresSkeleton } from '@/components/features/stores'

export default function StoresLoading() {
	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/tickets', label: 'Back to Receipts' }}
				title='My Stores'
				desc='The stores of your receipts. Rename a store, or merge two names for the same store.'
			/>
			<PageContainer>
				<StoresSkeleton />
			</PageContainer>
		</>
	)
}
