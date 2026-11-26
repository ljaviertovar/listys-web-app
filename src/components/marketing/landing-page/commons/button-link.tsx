import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
	/** `2xl` is the landing's 52px call to action; `xl` the 44px header action. */
	size?: Extract<ComponentProps<typeof Button>['size'], 'lg' | 'xl' | '2xl'>
	variant?: 'solid' | 'ghost'
	/** External layout only (width, margins). */
	className?: string
	'data-testid'?: string
	testId?: string
}

/** A navigation link drawn as the library Button, so links and buttons share one look. */
export function ButtonLink({
	size = 'lg',
	variant = 'solid',
	className,
	testId,
	'data-testid': dataTestId,
	...props
}: ButtonLinkProps) {
	const buttonVariant = variant === 'ghost' ? 'ghost' : 'default'

	return (
		<Button
			asChild
			size={size}
			variant={buttonVariant}
			className={className}
		>
			<Link
				data-testid={testId ?? dataTestId ?? 'landing-button-link'}
				{...props}
			/>
		</Button>
	)
}
