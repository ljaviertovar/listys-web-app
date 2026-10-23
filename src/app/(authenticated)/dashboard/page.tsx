import { Suspense } from 'react'

import { PageContainer } from '@/components/app'
import { DashboardContent, DashboardSkeleton } from '@/components/features/dashboard'

export default function DashboardPage() {
	return (
		// 64px under the last card on desktop (the design's), instead of the default 80px.
		<PageContainer className='lg:pb-8'>
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent />
			</Suspense>
		</PageContainer>
	)
}
