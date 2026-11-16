import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
	size?: 'lg'
	variant?: 'solid' | 'ghost'
	className?: string
	'data-testid'?: string
	testId?: string
}

export function ButtonLink({ size = 'lg', variant = 'solid', className, testId, 'data-testid': dataTestId, ...props }: ButtonLinkProps) {
	const buttonVariant = variant === 'ghost' ? 'outline' : 'default'

	return (
		<Button asChild size={size} variant={buttonVariant} className={className}>
			<Link data-testid={testId ?? dataTestId ?? 'landing-button-link'} {...props} />
		</Button>
	)
}
