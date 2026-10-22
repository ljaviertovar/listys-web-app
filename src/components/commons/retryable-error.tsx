import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface RetryableErrorProps {
	message: string
	href: string
	testId: string
}

/** A safe load failure with a real route the user can retry. */
export function RetryableError({ message, href, testId }: RetryableErrorProps) {
	return (
		<div data-testid={testId} role='alert' className='rounded-xl bg-destructive/10 p-4 text-sm text-destructive'>
			<p>{message}</p>
			<Button asChild variant='link' size='link-action' className='mt-1'>
				<Link href={href}>Try again</Link>
			</Button>
		</div>
	)
}
