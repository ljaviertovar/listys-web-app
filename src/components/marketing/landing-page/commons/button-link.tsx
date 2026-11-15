import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
	size?: 'sm' | 'lg' | 'xl'
	variant?: 'solid' | 'ghost'
	className?: string
	'data-testid'?: string
	testId?: string
}

export function ButtonLink({ size = 'lg', variant = 'solid', className, testId, 'data-testid': dataTestId, ...props }: ButtonLinkProps) {
	const buttonSize: NonNullable<ButtonProps['size']> = size === 'sm' ? 'sm' : size === 'xl' ? 'xl' : 'lg'
	const buttonVariant = variant === 'ghost' ? 'outline' : 'default'

	return (
		<Button asChild size={buttonSize} variant={buttonVariant} className={className}>
			<Link data-testid={testId ?? dataTestId ?? 'landing-button-link'} {...props} />
		</Button>
	)
}
