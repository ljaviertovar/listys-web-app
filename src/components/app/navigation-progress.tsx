'use client'

import { Suspense } from 'react'

import { Progress } from '@/components/ui/progress'
import { useNavigationProgress } from './hooks/use-navigation-progress'

function NavigationProgressTracker() {
	const { isVisible, progress } = useNavigationProgress()

	if (!isVisible) return null

	return (
		<Progress
			data-testid='navigation-progress'
			value={progress}
			aria-label='Loading page'
			size='sm'
			shape='square'
			className='fixed top-0 left-0 z-[60] h-1'
		/>
	)
}

export function NavigationProgress() {
	return (
		<Suspense fallback={null}>
			<NavigationProgressTracker />
		</Suspense>
	)
}
