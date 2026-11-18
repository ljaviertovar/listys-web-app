'use client'

import { useEffect } from 'react'
import { Home01Icon } from '@hugeicons/core-free-icons'

import { ErrorState } from '@/components/app'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Root error boundary:', error)
	}, [error])

	// It renders inside the root layout, which already owns <html> and <body>.
	return (
		<ErrorState
			digest={error.digest}
			reset={reset}
			exit={{ href: '/', label: 'Go Home', icon: Home01Icon }}
			fullScreen
			testId='root-error-state'
		/>
	)
}
