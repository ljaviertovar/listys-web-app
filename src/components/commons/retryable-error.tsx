import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RetryableErrorProps {
	message: string
	href: string
	testId: string
}

/** A safe load failure with a real route the user can retry. */
export function RetryableError({ message, href, testId }: RetryableErrorProps) {
	return (
		<Alert data-testid={testId} variant='destructive'>
			<AlertDescription>{message}</AlertDescription>
			<Button asChild variant='link' size='lg' className='mt-1'>
				<Link href={href}>Try again</Link>
			</Button>
		</Alert>
	)
}
