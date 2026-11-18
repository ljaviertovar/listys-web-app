'use client'

import { useEffect } from 'react'
import { Home01Icon } from '@hugeicons/core-free-icons'

import { ErrorState } from '@/components/app'
import './globals.css'

// The only boundary that catches a failure of the root layout, so it replaces the layout and owns <html> and <body>. The
// theme provider is part of that layout, which is why this page always uses the light theme.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Global error boundary:', error)
	}, [error])

	return (
		<html lang='en'>
			<body className='font-sans'>
				<ErrorState
					digest={error.digest}
					reset={reset}
					exit={{ href: '/', label: 'Go Home', icon: Home01Icon }}
					fullScreen
					testId='global-error-state'
				/>
			</body>
		</html>
	)
}
