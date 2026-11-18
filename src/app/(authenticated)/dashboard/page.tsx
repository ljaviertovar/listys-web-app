import { Suspense } from 'react'

import { PageContainer, PageHeader } from '@/components/app'
import { DashboardContent, DashboardGreeting, DashboardSkeleton } from '@/components/features/dashboard'
import { DashboardGreetingContent } from '@/components/features/dashboard/dashboard-greeting-content'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardGreetingSkeleton() {
	return (
		<div data-testid='dashboard-greeting-skeleton' role='status' aria-label='Loading your greeting'>
			<span className='sr-only'>Loading your greeting</span>
			<PageHeader
				title={<Skeleton className='h-8 w-64 max-w-full' />}
				desc={<Skeleton className='h-6 w-full max-w-md' />}
				testId='dashboard-greeting-skeleton-header'
			/>
		</div>
	)
}

export default function DashboardPage() {
	return (
		// 64px under the last card on desktop (the design's), instead of the default 80px.
		<>
			<Suspense fallback={<DashboardGreetingSkeleton />}>
				<DashboardGreetingContent />
			</Suspense>
			<PageContainer className='lg:pb-8'>
				<Suspense fallback={<DashboardSkeleton />}>
					<DashboardContent />
				</Suspense>
			</PageContainer>
		</>
	)
}
