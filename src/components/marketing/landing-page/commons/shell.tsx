import type { ComponentProps } from 'react'

import { cn } from '@/utils'

/** The landing page's centered max-width content wrapper, reused by every section. */
export function Shell({
	className,
	testId,
	'data-testid': dataTestId,
	...props
}: ComponentProps<'div'> & { testId?: string }) {
	return (
		<div
			className={cn('mx-auto max-w-[1200px] px-5 md:px-8', className)}
			data-testid={testId ?? dataTestId ?? 'landing-shell'}
			{...props}
		/>
	)
}
