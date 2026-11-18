'use client'

import { useEffect } from 'react'

import { ErrorState } from '@/components/app'

export default function AuthenticatedError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Authenticated section error:', error)
	}, [error])

	return (
		<ErrorState
			digest={error.digest}
			reset={reset}
			exit={{ href: '/dashboard', label: 'Go to Dashboard' }}
			testId='app-error-state'
		/>
	)
}
