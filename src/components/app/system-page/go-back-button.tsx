'use client'

import type { ComponentProps } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface GoBackButtonProps extends Omit<ComponentProps<typeof Button>, 'children' | 'onClick' | 'asChild'> {
	/** Where to go when there is no page to go back to, such as a link opened in a new tab. */
	fallbackHref: string
	testId: string
}

export function GoBackButton({ fallbackHref, testId, variant = 'outline', size = 'xl', ...props }: GoBackButtonProps) {
	const router = useRouter()

	return (
		<Button
			variant={variant}
			size={size}
			{...props}
			data-testid={testId}
			onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
		>
			<HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.8} data-icon='inline-start' />
			Go Back
		</Button>
	)
}
